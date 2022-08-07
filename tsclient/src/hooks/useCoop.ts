import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameMode } from '../api/page';
import { Guess } from '../components/Guess';
import { pluralize } from '../utils/plural';
import useStoredValue from './useStoredValue';

export type ExpireType = 'today' | 'custom';
export type CoopGameType = 'today' | 'random';

interface MessageRename {
  type: 'RENAME';
  from: string | null;
  to: string | null;
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
  | MessageRename
  | MessageJoinFail
  | MessageGuess;

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
  registerGuessReciever: (reciever: (guessIdx: number, guess: Guess) => void) => void;
  registerRenameReciever: (reciever: (from: string, to: string) => void) => void;
  guess: (lex: string) => void;
}

function useCoop(gameMode: GameMode): Coop {
  const { enqueueSnackbar } = useSnackbar();
  const [username, setUsername] = useStoredValue<string | null>('coop-name', null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useStoredValue<string | null>('coop-room', null);
  const [users, setUsers] = useState<string[] | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [
    recieveGuess, setRecieveGuess,
  ] = useState<((guessIdx: number, guess: Guess) => void) | null>(null);
  const [
    recieveRename, setRecieveRename,
  ] = useState<((from: string, to: string) => void) | null>(null);

  const createGame = useCallback((
    gameType: CoopGameType,
    expireType: ExpireType,
    expire: number,
  ) => {
    socket?.emit(
      'create game',
      {
        username, gameType, expireType, expire,
      },
    );
  }, [username, socket]);

  const guess = useCallback((lex: string) => {
    socket?.emit('guess', { room, username, lex });
  }, [room, socket, username]);

  const renameMe = useCallback((newName: string | null) => {
    if (socket === null) {
      setUsername(newName);
    } else if (room !== null || newName === null) {
      socket.emit('rename', { room, from: username, to: newName });
    } else {
      setUsername(newName);
    }
  }, [room, setUsername, socket, username]);

  const join = useCallback((newRoom: string) => {
    setUsers(null);
    setRoom(newRoom);
    socket?.emit('join', { username, room: newRoom });
  }, [setRoom, socket, username]);

  const leave = useCallback((silentFail = false): void => {
    if (room === null) {
      if (!silentFail) {
        enqueueSnackbar('You are not in COOP-game', { variant: 'error' });
      }
      return;
    }

    socket?.emit('leave', { username, room });
  }, [enqueueSnackbar, room, socket, username]);

  const disconnect = useCallback((): void => {
    socket?.disconnect();
    setUsers(null);
  }, [socket]);

  const connect = useCallback((reconnect = false): void => {
    if (socket !== null) {
      socket.connect();
      return;
    }

    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      enqueueSnackbar('You are live-connected', { variant: 'info' });
      setConnected(true);
      if (room !== null && reconnect) {
        newSocket.emit('join', { username, room });
      }
    });

    newSocket.on('disconnect', () => {
      enqueueSnackbar('You are no longer live-connected', { variant: 'info' });
      setConnected(false);
    });
  }, [enqueueSnackbar, room, socket, username]);

  useEffect((): void => {
    if (socket === null) return;

    const messageHandler = (message: Message) => {
      switch (message.type) {
        case 'CREATE':
          enqueueSnackbar('Created new COOP-game', { variant: 'info' });
          setRoom(message.room);
          setUsers([message.username]);
          if (username !== message.username) {
            enqueueSnackbar(
              `You are known as '${message.username}'`,
              { variant: 'info' },
            );
            setUsername(message.username);
          }
          break;

        case 'LEAVE':
          setUsers(message.users);
          enqueueSnackbar(
            message.name === username ? 'You left the game' : `${message.name} left the game`,
            { variant: 'info' },
          );
          if (message.name === username) {
            setRoom(null);
            setUsers(null);
            socket?.disconnect();
          }
          break;

        case 'JOIN':
          enqueueSnackbar(
            users === null
              ? `Joined a game with ${message.users.length} ${pluralize('user', message.users.length)}`
              : `${message.name} joined the game`,
            { variant: 'info' },
          );
          if (message.name !== username) {
            setUsername(message.name);
          }
          setUsers(message.users);
          break;

        case 'JOIN-FAIL':
          enqueueSnackbar(message.reason, { variant: 'error' });
          setRoom(null);
          break;

        case 'RENAME':
          enqueueSnackbar(
            message.from === username
              ? `New COOP name is: ${message.to}`
              : `User "${message.from}" is now known as "${message.to}"`,
            { variant: 'info' },
          );
          if (message.from === username) setUsername(message.to);
          if (message.from !== null && message.to !== null) {
            recieveRename?.(message.from, message.to);
          }
          break;
        case 'GUESS':
          recieveGuess?.(message.index, [message.lex, false, message.username]);
          break;
        default:
          // eslint-disable-next-line no-console
          console.warn('unhandled coop-message', message);
          break;
      }
    };

    socket.off('message');
    socket.on('message', messageHandler);
  }, [enqueueSnackbar, recieveGuess, recieveRename, setRoom, setUsername, socket, username, users]);

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
    connected,
    room,
    connect,
    join,
    username,
    leave,
    renameMe,
    disconnect,
    users: users ?? [],
    registerGuessReciever: setRecieveGuess,
    guess,
    registerRenameReciever: setRecieveRename,
  };
}

export default useCoop;
