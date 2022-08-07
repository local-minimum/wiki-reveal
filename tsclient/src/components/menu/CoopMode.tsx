import {
  faBroom, faClose, faCopy, faPaw, faSave, faSquarePlus,
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
  Stack, Switch, TextField, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { GameMode } from '../../api/page';
import { CoopGameType, ExpireType } from '../../hooks/useCoop';
import usePrevious from '../../hooks/usePrevious';

interface CoopModeProps {
  onClose: () => void;
  username: string | null;
  onChangeUsername: (newName: string | null) => void;
  connected: boolean;
  onCreateGame: (gameType: CoopGameType, expireType: ExpireType, expire: number) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  gameMode: GameMode;
  room: string | null;
  users: string[];
}

function usersToText(users: string[]): string {
  if (users.length === 0) return 'noone';
  return `${users.slice(0, users.length - 1).join(', ')} & ${users[users.length - 1]}`;
}

function CoopMode({
  onClose, username, onChangeUsername, connected, onCreateGame, gameMode,
  onConnect, onDisconnect, room, users,
}: CoopModeProps): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const previousConnected = usePrevious(connected);
  const [waitedAWhile, setWaitedAWhile] = React.useState<boolean>(false);
  const [newName, setNewName] = React.useState<string>('');
  const [createType, setCreateType] = React.useState<CoopGameType>('today');
  const [expireType, setExpireType] = React.useState<ExpireType>('today');
  const [expire, setExpire] = React.useState<number>(24);

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
          {room !== null && (
            <Typography gutterBottom>
              You are in COOP room
              {' '}
              <strong>{room}</strong>
              <IconButton
                title="Copy room ID to clipboard."
                onClick={() => {
                  enqueueSnackbar('Room ID copied to clipboard', { variant: 'info' });
                  navigator.clipboard.writeText(room);
                }}
                size="small"
              >
                <FontAwesomeIcon icon={faCopy} />
              </IconButton>
              {' '}
              together with
              {' '}
              {usersToText(users.filter((user) => user !== username))}
              .
            </Typography>
          )}
          <Typography gutterBottom>
            Please note that if you choose to play today&apos;s game in coop mode
            your current progres will be reset.
          </Typography>
          <Typography gutterBottom>
            {
              username == null
                ? 'You currently don\'t have a user name, one will be generated for you unless you create one first.'
                : (
                  <>
                    You are currently known as
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
              onChange={({ target: { value } }) => setNewName(value ?? '')}
            />
            <Button
              disabled={newName.trim().length === 0}
              variant="contained"
              onClick={() => { onChangeUsername(newName.trim()); setNewName(''); }}
              startIcon={<FontAwesomeIcon icon={faSave} />}
            >
              Save Name
            </Button>
            <Button
              variant="contained"
              onClick={() => onChangeUsername(null)}
              startIcon={<FontAwesomeIcon icon={connected ? faPaw : faBroom} />}
            >
              {connected ? 'Generate' : 'Clear Name' }
            </Button>
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
              <FormControlLabel value="today" control={<Radio />} label="Today's" />
              <FormControlLabel value="random" control={<Radio />} label="Random" />
            </RadioGroup>
          </FormControl>
          <Stack direction="row" gap={1}>
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
          <Button
            variant="contained"
            startIcon={<FontAwesomeIcon icon={faSquarePlus} />}
            onClick={() => onCreateGame(createType, expireType, expire)}
            disabled={connected !== true}
          >
            Create
          </Button>

        </DialogContentText>
      </DialogContent>
      <DialogActions>
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