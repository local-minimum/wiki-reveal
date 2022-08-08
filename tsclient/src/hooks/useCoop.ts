import { useSnackbar } from 'notistack';
import {
  useCallback, useEffect, useRef,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { GameMode } from '../api/page';
import { Guess } from '../components/Guess';
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

interface MessageGuesses {
  type: 'GUESSES',
  backlog: Array<[string, string]>,
}

type Message = MessageCreate
  | MessageJoinLeave
  | MessageJoinFail
  | MessageLeaveMe
  | MessageJoinMe
  | MessageRename
  | MessageRenameMe
  | MessageGuess
  | MessageGuesses;

interface Coop {
  connected: boolean;
  room: string | null;
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
  const { resetTransactions, endTransaction } = useTransaction();
  const { enqueueSnackbar } = useSnackbar();

  const inRoomRef = useRef(false);
  const socketRef = useRef<Socket | null>(null);
  const usersRef = useRef<string[] | null>(null);
  const guessesRef = useRef<Guess[]>([]);
  const connectedRef = useRef<boolean>(false);
  const [usernameRef, setUsername] = useStoredRef<string | null>('coop-name', null);
  const [roomRef, setRoom] = useStoredRef<string | null>('coop-room', null);

  const createGame = useCallback((
    gameType: CoopGameType,
    expireType: ExpireType,
    expire: number,
  ) => {
    socketRef.current?.emit(
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
  }, []);

  const guess = useCallback((lex: string) => {
    socketRef.current?.emit(
      'guess',
      { room: roomRef.current, username: usernameRef.current, lex },
    );
  // roomRef, usernameRef are invariant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renameMe = useCallback((newName: string | null) => {
    if (socketRef.current === null) {
      setUsername(newName);
      endTransaction();
    } else if (roomRef.current !== null || newName === null) {
      if (inRoomRef.current) {
        socketRef.current.emit(
          'rename',
          { room: roomRef.current, from: usernameRef.current, to: newName },
        );
      } else {
        socketRef.current.emit(
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
  }, [setUsername]);

  const join = useCallback((newRoom: string) => {
    usersRef.current = null;
    setRoom(newRoom);
    guessesRef.current = [];
    socketRef.current?.emit(
      'join',
      { username: usernameRef.current, room: newRoom },
    );
    endTransaction();
  // endTransaction, usernameRef are invariant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRoom]);

  const leave = useCallback((silentFail = false): void => {
    if (roomRef.current === null) {
      if (!silentFail) {
        enqueueSnackbar('You are not in COOP-game', { variant: 'error' });
      }
      return;
    }

    socketRef.current?.emit(
      'leave',
      { username: usernameRef.current, room: roomRef.current },
    );

  // roomRef, usernameRef are invariant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enqueueSnackbar]);

  const disconnect = useCallback((): void => {
    socketRef.current?.disconnect();
    usersRef.current = null;
    inRoomRef.current = false;
    endTransaction();

  // endTransaction are invariant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = useCallback((reconnect = false): void => {
    if (socketRef.current !== null) {
      socketRef.current.connect();
      return;
    }

    const fullPath = `${window.location.href.replace(/\/$/, '')}/socket.io`;
    const host = fullPath.slice(
      0,
      fullPath.indexOf(window.location.host) + window.location.host.length,
    );
    const path = fullPath.slice(host.length);
    // eslint-disable-next-line no-console
    console.log('Attempting WS at', host, path);
    const newSocket = io(host, { path });
    socketRef.current = newSocket;

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

    resetTransactions();
  // endTransaction, resetTransactions, roomRef, usernameRef are invariant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enqueueSnackbar]);

  useEffect((): void => {
    if (socketRef.current === null) return;

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
        case 'GUESSES':
          guessesRef.current = message.backlog.map(([lex, user]) => [lex, false, user]);
          endTransaction();
          break;
        default:
          // eslint-disable-next-line no-console
          console.warn('unhandled coop-message', message);
          break;
      }
    };

    socketRef.current.off('message');
    socketRef.current.on('message', messageHandler);

  // endTransaction, usernameRef are invariant
  // socketRef.current changes are coupled with things that rerenders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enqueueSnackbar, setRoom, setUsername, socketRef.current]);

  useEffect(() => () => {
    socketRef.current?.disconnect();
  }, []);

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
