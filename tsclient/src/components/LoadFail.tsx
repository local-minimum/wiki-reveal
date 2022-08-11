import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link, Typography,
} from '@mui/material';
import * as React from 'react';
import { GameMode } from '../api/page';

interface LoadFailProps {
  gameMode: GameMode;
  onClose: () => void;
}

function LoadFail({ gameMode, onClose }: LoadFailProps): JSX.Element {
  const [open, setOpen] = React.useState<boolean>(true);
  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        Failed to load
        {' '}
        {gameMode === 'coop' ? 'COOP game' : 'article'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {gameMode === 'coop' ? (
            <>
              <Typography gutterBottom>
                This is probably because the game has expired, either because
                you are out of time, or because the server has rebooted
                (sorry in that case).
              </Typography>
              <Typography gutterBottom>
                Open the menu and select playing today&apos;s game or
                start/join a new coop game.
              </Typography>
            </>
          ) : (
            <Typography gutterBottom>
              Hopefully this is a transitory thing so check back in a little
              while and it ought to be up and runnig.
            </Typography>
          )}
          <Typography>
            However, should there be cause for concern consider reporting
            an issue on
            {' '}
            <Link href="https://github.com/local-minimum/wiki-reveal/issues">
              Github
            </Link>
            .
          </Typography>
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

export default LoadFail;
