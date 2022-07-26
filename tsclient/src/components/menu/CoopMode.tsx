import {
  faBroom, faClose, faCopy, faPaw, faSave, faSquarePlus, faHandshake, faPersonWalkingLuggage,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  Stack, Switch, TextField, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { GameMode } from '../../api/page';
import { CoopGameType, CoopRoomSettings, ExpireType } from '../../hooks/useCoop';
import usePrevious from '../../hooks/usePrevious';
import useStoredValue from '../../hooks/useStoredValue';
import { Guess } from '../Guess';
import { usersToText } from './usersToText';

interface CoopModeProps {
  onClose: () => void;
  username: string | null;
  onChangeUsername: (newName: string | null) => void;
  connected: boolean;
  onCreateGame: (
    gameType: CoopGameType,
    expireType: ExpireType,
    expire: number,
    guesses: Array<[string, boolean]>,
    settings: CoopRoomSettings,
  ) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  gameMode: GameMode;
  gameId: number | undefined;
  room: string | null;
  inRoom: boolean;
  users: string[];
  onJoin: (room: string) => void;
  onQuitCoop: () => void;
}

function gameModeAsString(coopGameType: CoopGameType): string {
  switch (coopGameType) {
    case 'random':
      return 'Random';
    case 'today':
      return 'Today\'s';
    case 'yesterday':
      return 'Yesterday\'s';
    default:
      return 'Unknown Mode';
  }
}

function remapGameId(
  gameId: number | undefined,
  gameMode: GameMode,
  wantedCoopMode: CoopGameType,
): number | undefined {
  if (gameId === undefined) return undefined;
  if (gameMode === 'today' && wantedCoopMode === 'yesterday') return gameId - 1;
  if (gameMode === 'yesterday' && wantedCoopMode === 'today') return gameId + 1;
  return gameId;
}

function CoopMode({
  onClose, username, onChangeUsername, connected, onCreateGame, gameMode,
  onConnect, onDisconnect, room, users, onJoin, inRoom, onQuitCoop, gameId,
}: CoopModeProps): JSX.Element {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  const previousConnected = usePrevious(connected);
  const [waitedAWhile, setWaitedAWhile] = React.useState<boolean>(false);
  const [newName, setNewName] = React.useState<string>('');
  const [createType, setCreateType] = React.useState<CoopGameType>('random');
  const [expireType, setExpireType] = React.useState<ExpireType>('today');
  const [expire, setExpire] = React.useState<number>(24);
  const [joinRoom, setJoinRoom] = React.useState<string | null>(null);
  const [transferGuesses, setTransferGuesses] = React.useState<boolean>(false);
  const [allowHints, setAllowHints] = React.useState<boolean>(false);
  const [soloGuesses] = useStoredValue<Guess[]>(
    `guesses-solo-${remapGameId(gameId, gameMode, createType)}`,
    [],
  );

  React.useEffect(() => {
    if (connected === false && previousConnected !== connected) onConnect();
  }, [onConnect, connected, previousConnected]);

  React.useEffect(() => {
    setTimeout(() => setWaitedAWhile(true), 10 * 1000);
  }, []);

  const handleClose = () => {
    if (connected && gameMode !== 'coop') onDisconnect();
    onClose();
  };

  const liveInCoopRoom = room !== null && inRoom && gameMode === 'coop';

  return (
    <Dialog
      open
      onClose={handleClose}
    >
      <DialogTitle>COOP Mode</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {waitedAWhile && !connected && (
            <Alert severity="warning">
              It seems to be taking a while to establish a live connection.
              If the problem persist, then you are probably running an extremely old
              browser or something is blocking websockets.
            </Alert>
          )}
          <Typography gutterBottom>
            {
              username == null
                ? 'You don\'t have a user name, one will be generated for you unless you create one first.'
                : (
                  <>
                    You are known as
                    {' '}
                    <strong>{username}</strong>
                  </>
                )
            }
          </Typography>
          <Stack direction="row" gap={1} sx={{ marginTop: 1 }}>
            <TextField
              sx={{ flex: 1 }}
              variant="outlined"
              value={newName}
              label="User name"
              size={isSmall ? 'small' : 'medium'}
              onChange={({ target: { value } }) => setNewName(value ?? '')}
            />
            {isSmall ? (
              <IconButton
                disabled={newName.trim().length === 0}
                onClick={() => { onChangeUsername(newName.trim()); setNewName(''); }}
              >
                <FontAwesomeIcon icon={faSave} />
              </IconButton>
            ) : (
              <Button
                disabled={newName.trim().length === 0}
                variant="contained"
                onClick={() => { onChangeUsername(newName.trim()); setNewName(''); }}
                startIcon={<FontAwesomeIcon icon={faSave} />}
              >
                Save Name
              </Button>
            )}
            {isSmall ? (
              <IconButton onClick={() => onChangeUsername(null)}>
                <FontAwesomeIcon icon={connected ? faPaw : faBroom} />
              </IconButton>
            ) : (
              <Button
                variant="contained"
                onClick={() => onChangeUsername(null)}
                startIcon={<FontAwesomeIcon icon={connected ? faPaw : faBroom} />}
              >
                {connected ? 'Generate' : 'Clear Name' }
              </Button>
            )}
          </Stack>
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Create COOP room
          </Typography>
          <FormControl>
            <RadioGroup
              row
              value={createType}
              onChange={({ target: { value } }) => setCreateType(value as CoopGameType)}
            >
              <FormControlLabel value="random" control={<Radio />} label="Random" />
              <FormControlLabel value="yesterday" control={<Radio />} label="Yesterday's" />
              <FormControlLabel value="today" control={<Radio />} label="Today's" />
            </RadioGroup>
          </FormControl>
          <Stack direction={isSmall ? 'column' : 'row'} gap={1}>
            <FormGroup>
              <FormControlLabel
                checked={expireType === 'today'}
                label="Expire with today's"
                control={<Switch />}
                onChange={() => setExpireType(expireType === 'today' ? 'custom' : 'today')}
              />
            </FormGroup>
            <TextField
              disabled={expireType !== 'custom'}
              value={expire}
              variant="outlined"
              type="number"
              size="small"
              onChange={
                ({ target: { value } }) => setExpire(Math.min(Math.max(parseInt(value, 10), 1), 24))
              }
              InputProps={{
                endAdornment: <InputAdornment position="end">h</InputAdornment>,
              }}
              label="Expire in"
            />
          </Stack>
          <FormGroup>
            <FormControlLabel
              checked={createType !== 'random' && transferGuesses}
              label="Transfer your guesses to the coop game"
              disabled={createType === 'random'}
              control={<Switch />}
              onChange={(_, checked) => setTransferGuesses(checked)}
            />
          </FormGroup>
          <Typography variant="caption">
            When transferring guesses, it will always include hints,
            even if no further hints are allowed in the coop game.
          </Typography>
          <FormGroup>
            <FormControlLabel
              checked={allowHints}
              label="Allow the use of hints in the coop game"
              control={<Switch />}
              onChange={(_, checked) => setAllowHints(checked)}
            />
          </FormGroup>
          <Typography variant="caption">
            Hints are still only visible to the user if they have
            enabled hints in the settings.
          </Typography>
          <Stack direction="row" sx={{ marginTop: 1 }} gap={1}>
            <Button
              variant="contained"
              startIcon={<FontAwesomeIcon icon={faSquarePlus} />}
              onClick={() => onCreateGame(
                createType,
                expireType,
                expire,
                createType === 'random' || !transferGuesses
                  ? []
                  : soloGuesses.map(([lex, isHint]) => [lex, isHint]),
                {
                  allowHints,
                },
              )}
              disabled={connected !== true}
            >
              Create
            </Button>
            {liveInCoopRoom && (
              <Button
                title="Copy room ID to clipboard."
                onClick={() => {
                  enqueueSnackbar('Room ID copied to clipboard', { variant: 'info' });
                  const url = `${window.location.href.split('?')[0]}?coop=${room}`;
                  navigator.clipboard.writeText(
                    `Join my Coop Wiki Reveal game (${gameModeAsString(createType)}): ${url}`,
                  );
                }}
                variant="contained"
                size="small"
                startIcon={<FontAwesomeIcon icon={faCopy} />}
              >
                Copy invite link
              </Button>
            )}
          </Stack>
          {liveInCoopRoom && (
            <Typography variant="caption" gutterBottom>
              You are in the COOP game
              {' '}
              {room}
              {' '}
              together with
              {' '}
              {usersToText(users.filter((user) => user !== username))}
              .
            </Typography>
          )}
          <Typography variant="h6" sx={{ marginTop: 2, marginBottom: 1 }}>
            Join existing COOP room
          </Typography>
          <Stack direction="row" gap={1}>
            <TextField
              sx={{ flex: 1 }}
              variant="outlined"
              value={joinRoom ?? room ?? ''}
              label="Room ID"
              size={isSmall ? 'small' : 'medium'}
              onChange={({ target: { value } }) => setJoinRoom(value ?? '')}
            />
            {isSmall ? (
              <Button
                disabled={connected !== true || (joinRoom ?? room ?? '').trim().length === 0}
                onClick={() => {
                  onJoin((joinRoom ?? room ?? '').trim());
                  onClose();
                }}
              >
                <FontAwesomeIcon icon={faHandshake} />
              </Button>
            ) : (
              <Button
                disabled={connected !== true || (joinRoom ?? room ?? '').trim().length === 0}
                variant="contained"
                onClick={() => {
                  onJoin((joinRoom ?? room ?? '').trim());
                  onClose();
                }}
                startIcon={<FontAwesomeIcon icon={faHandshake} />}
              >
                Join
              </Button>
            )}
          </Stack>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          disabled={gameMode !== 'coop'}
          onClick={() => {
            handleClose();
            onQuitCoop();
          }}
          startIcon={<FontAwesomeIcon icon={faPersonWalkingLuggage} />}
        >
          Exit Coop-Mode
        </Button>
        <Button
          variant="outlined"
          onClick={handleClose}
          startIcon={<FontAwesomeIcon icon={faClose} />}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CoopMode;
