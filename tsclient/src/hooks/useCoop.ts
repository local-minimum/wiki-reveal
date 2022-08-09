import { useSnackbar } from 'notistack';
import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { GameMode } from '../api/page';
import { Guess } from '../components/Guess';
import { RoomId } from '../utils/achievements';
import useStoredRef from './useStoredRef';
import useTransaction from './useTransaction';

export type ExpireType = 'today' | 'custom';
export type CoopGameType = 'today' | 'random';

interface MessageRename {
  type: 'RENAME';
  from: string | null;
  to: string;
}

interface MessageRenameMe {
  type: 'RENAME-ME';
  to: string;
}

interface MessageCreate {
  type: 'CREATE';
  room: string;
  username: string;
}

interface MessageJoinLeave {
  type: 'JOIN' | 'LEAVE';
  name: string | null;
  users: string[];
}

interface MessageLeaveMe {
  type: 'LEAVE-ME';
}

interface MessageJoinMe {
  type: 'JOIN-ME';
  room: string;
  users: string[];
  backlog: Array<[string, string]>,
}

interface MessageJoinFail {
  type: 'JOIN-FAIL',
  reason: string;
}

interface MessageGuess {
  type: 'GUESS',
  lex: string;
  username: string;
  index: number;
}

type Message = MessageCreate
  | MessageJoinLeave
  | MessageJoinFail
  | MessageLeaveMe
  | MessageJoinMe
  | MessageRename
  | MessageRenameMe
  | MessageGuess;

interface Coop {
  connected: boolean;
  room: RoomId | null;
  connect: () => void;
  disconnect: () => void;
  createGame: (gameType: CoopGameType, expireType: ExpireType, expire: number) => void;
  join: (room: string) => void;
  leave: () => void;
  username: string | null;
  renameMe: (newName: string | null) => void;
  users: string[],
  guess: (lex: string) => void;
  guesses: Guess[];
  inRoom: boolean;
}

function useCoop(gameMode: GameMode): Coop {
  const { endTransaction } = useTransaction();
  const { enqueueSnackbar } = useSnackbar();

  const inRoomRef = useRef(false);
  const usersRef = useRef<string[] | null>(null);
  const guessesRef = useRef<Guess[]>([]);
  const connectedRef = useRef<boolean>(false);
  const [usernameRef, setUsername] = useStoredRef<string | null>('coop-name', null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomRef, setRoom] = useStoredRef<RoomId | null>('coop-room', null);

  const createGame = useCallback((
    gameType: CoopGameType,
    expireType: ExpireType,
    expire: number,
  ) => {
    socket?.emit(
      'create game',
      {
        username: usernameRef.current,
        gameType,
        expireType,
        expire,
      },
    );
  // usernameRef are invariant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const guess = useCallback((lex: string) => {
    socket?.emit(
      'guess',
      { room: roomRef.current, username: usernameRef.current, lex },
    );
  // roomRef, usernameRef are invariant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const renameMe = useCallback((newName: string | null) => {
    if (socket === null) {
      setUsername(newName);
      endTransaction();
    } else if (roomRef.current !== null || newName === null) {
      if (inRoomRef.current) {
        socket.emit(
          'rename',
          { room: roomRef.current, from: usernameRef.current, to: newName },
        );
      } else {
        socket.emit(
          'rename',
          { from: usernameRef.current, to: newName },
        );
      }
    } else {
      setUsername(newName);
      endTransaction();
    }
  // endTransaction, usernameRef, roomRef are invariant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUsername, socket]);

  const join = useCallback((newRoom: string) => {
    usersRef.current = null;
    setRoom(newRoom);
    guessesRef.current = [];
    socket?.emit(
      'join',
      { username: usernameRef.current, room: newRoom },
    );
    endTransaction();
  // endTransaction, usernameRef are invariant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRoom, socket]);

  const leave = useCallback((silentFail = false): void => {
    if (roomRef.current === null) {
      if (!silentFail) {
        enqueueSnackbar('You are not in COOP-game', { variant: 'error' });
      }
      return;
    }

    socket?.emit(
      'leave',
      { username: usernameRef.current, room: roomRef.current },
    );

  // roomRef, usernameRef are invariant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enqueueSnackbar, socket]);

  const disconnect = useCallback((): void => {
    socket?.disconnect();
    usersRef.current = null;
    inRoomRef.current = false;
    endTransaction();

  // endTransaction are invariant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const connect = useCallback((reconnect = false): void => {
    if (socket !== null) {
      if (!socket.connected) {
        socket.connect();
      }
      return;
    }

    const fullPath = `${window.location.href.split('?')[0].replace(/\/$/, '')}/socket.io`;
    const host = fullPath.slice(
      0,
      fullPath.indexOf(window.location.host) + window.location.host.length,
    );
    const path = fullPath.slice(host.length);
    // eslint-disable-next-line no-console
    console.log('Attempting WS at', host, path);
    const newSocket = io(host, { path });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      enqueueSnackbar('You are live-connected', { variant: 'info' });
      connectedRef.current = true;
      if (roomRef.current !== null && reconnect) {
        newSocket.emit(
          'join',
          { username: usernameRef.current, room: roomRef.current },
        );
      }
      endTransaction();
    });

    newSocket.on('disconnect', () => {
      enqueueSnackbar('You are no longer live-connected', { variant: 'info' });
      connectedRef.current = false;
      endTransaction();
    });

  // endTransaction, roomRef, usernameRef are invariant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enqueueSnackbar, socket]);

  useEffect((): void => {
    if (socket === null) return;

    const messageHandler = (message: Message) => {
      switch (message.type) {
        case 'CREATE':
          enqueueSnackbar('Created new COOP game', { variant: 'info' });
          setRoom(message.room);
          usersRef.current = [message.username];
          guessesRef.current = [];
          if (usernameRef.current !== message.username) {
            enqueueSnackbar(
              `You are known as '${message.username}'`,
              { variant: 'info' },
            );
            setUsername(message.username);
          }
          inRoomRef.current = true;
          endTransaction();
          break;

        case 'LEAVE':
          usersRef.current = message.users;
          enqueueSnackbar(
            `${message.name} left the COOP game`,
            { variant: 'info' },
          );
          endTransaction();
          break;

        case 'LEAVE-ME':
          setRoom(null);
          usersRef.current = null;
          enqueueSnackbar(
            'You left the COOP game',
            { variant: 'info' },
          );
          inRoomRef.current = false;
          endTransaction();
          break;

        case 'JOIN':
          enqueueSnackbar(
            `${message.name} joined the COOP game`,
            { variant: 'info' },
          );
          usersRef.current = message.users;
          endTransaction();
          break;

        case 'JOIN-ME':
          enqueueSnackbar(
            'You joined the COOP game',
            { variant: 'info' },
          );
          setRoom(message.room);
          usersRef.current = message.users;
          inRoomRef.current = true;
          guessesRef.current = message.backlog.map(([lex, user]) => [lex, false, user]);
          endTransaction();
          break;

        case 'JOIN-FAIL':
          enqueueSnackbar(message.reason, { variant: 'error' });
          setRoom(null);
          endTransaction();
          break;

        case 'RENAME':
          enqueueSnackbar(
            `User "${message.from}" is now known as "${message.to}"`,
            { variant: 'info' },
          );
          if (message.from !== null && message.to !== null) {
            guessesRef.current = guessesRef.current.map(([lex, isHint, user]) => [
              lex,
              isHint,
              user === message.from ? message.to : user,
            ]);
            endTransaction();
          }
          break;

        case 'RENAME-ME':
          setUsername(message.to);
          endTransaction();
          break;

        case 'GUESS':
          guessesRef.current = [
            ...new Array(Math.max(message.index + 1, guessesRef.current.length)).keys(),
          ].map((idx) => (
            idx === message.index
              ? [message.lex, false, message.username]
              : (guessesRef.current[idx] ?? ['', false, null])
          ));
          endTransaction();
          break;

        default:
          // eslint-disable-next-line no-console
          console.warn('unhandled coop-message', message);
          break;
      }
    };

    socket.off('message');
    socket.on('message', messageHandler);

  // endTransaction, usernameRef are invariant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enqueueSnackbar, setRoom, setUsername, socket]);

  useEffect(() => () => {
    socket?.disconnect();
  }, [socket]);

  useEffect(
    () => {
      if (gameMode === 'coop') connect(true);
    },
    // Should only run at start of coop
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameMode],
  );

  return {
    createGame,
    connected: connectedRef.current,
    room: roomRef.current,
    connect,
    join,
    username: usernameRef.current,
    leave,
    renameMe,
    disconnect,
    users: usersRef.current ?? [],
    guess,
    guesses: guessesRef.current,
    inRoom: inRoomRef.current && roomRef.current !== null,
  };
}

export default useCoop;
