import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link,
} from '@mui/material';
import * as React from 'react';

interface InfoDialogProps {
  onClose: () => void;
}

function InfoDialog({ onClose }: InfoDialogProps): JSX.Element {
  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>About</DialogTitle>
      <DialogContent>
        <DialogContentText gutterBottom>
          This variant of
          {' '}
          <Link href="https://www.redactle.com">Redactle</Link>
          {' '}
          came into being after loving the original quite a lot but
          wanting to experiment with giving the player some more
          info and options when getting stuck.
        </DialogContentText>
        <DialogContentText gutterBottom>
          If you find any error consider reporting them on
          {' '}
          <Link href="https://github.com/local-minimum/wiki-reveal/issues">
            the Github repository
          </Link>
          .
          If you like (or dislike) what you see here, then feel free to fork or
          contribute to the project.
        </DialogContentText>
        <DialogContentText>
          This site stores user settings and your guesses locally in your browser.
          You can at any time wipe this data from the game menu, but it will clear
          your current game, your victories and achievements.
          We do record a hashed version of your IP as a way to track number of users
          to the site per day and it is recorded in the server logs for security and
          abuse prevention, but no more tracking is performed.
          We do not sell or give away information about its users.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<FontAwesomeIcon icon={faClose} />}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default InfoDialog;
