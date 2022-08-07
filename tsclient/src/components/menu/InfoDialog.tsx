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
          This site does not track you in any way except game related
          things stored locally in your browser.
          Neither does it sell or give away information about its users,
          at least not by intent.
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
