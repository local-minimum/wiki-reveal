import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { pluralize } from '../utils/plural';
import useStoredValue from './useStoredValue';

interface MessageCreate {
  type: 'CREATE';
  room: string;
  username: string;
}

interface MessageJoinLeave {
  type: 'JOIN' | 'LEAVE';
  name: string;
  users: string[];
}

type Message = MessageCreate | MessageJoinLeave;

interface Coop {
  connected: boolean | undefined;
  room: string | null;
  connect: () => void;
  createGame: () => void;
  join: (room: string) => void;
  leave: () => void;
  username: string | null;
}

function useCoop(): Coop {
  const { enqueueSnackbar } = useSnackbar();
  const [username, setUsername] = useStoredValue<string | null>('coop-name', null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<string | null>(null);
  const [users, setUsers] = useState<string[] | null>(null);

  const createGame = useCallback(() => { socket?.emit('create game', { username }); }, [username, socket]);

  const join = useCallback((newRoom: string) => {
    setUsers(null);
    setRoom(newRoom);
    socket?.emit('join', { username, room: newRoom });
  }, [socket, username]);

  const leave = useCallback((silentFail = false): void => {
    if (room === null) {
      if (!silentFail) {
        enqueueSnackbar('You are not in COOP-game', { variant: 'error' });
      }
      return;
    }

    socket?.emit('leave', { username, room });
  }, [enqueueSnackbar, room, socket, username]);

  const connect = useCallback((): void => {
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

        default:
          // eslint-disable-next-line no-console
          console.log('unhandled coop-message', message);
          break;
      }
    };

    if (socket !== null) {
      if (!socket.connect) socket.connect();
      socket.off('message');
      socket.on('message', messageHandler);
      return;
    }

    const newSocket = io();
    newSocket.on('message', messageHandler);
    newSocket.on('connect', () => {
      setSocket(newSocket);
    });
  }, [enqueueSnackbar, setUsername, socket, username, users]);

  useEffect(() => () => {
    leave(true);
    socket?.disconnect();
  }, [leave, socket]);

  return {
    createGame,
    connected: socket?.connected,
    room,
    connect,
    join,
    username,
    leave,
  };
}

export default useCoop;
