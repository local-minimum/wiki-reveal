import { faBroom, faCancel } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';
import * as React from 'react';

interface WipeDataDialogProps {
  onClose: () => void;
}

function WipeDataDialog({ onClose }: WipeDataDialogProps): JSX.Element {
  const handleWipe = (): void => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Wipe all stored data</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This will remove your stored preferences,
          your achievements, your win-history,
          and your progress on current game(s).
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleWipe}
          startIcon={<FontAwesomeIcon icon={faBroom} />}
          variant="outlined"
        >
          Wipe
        </Button>
        <Button
          onClick={onClose}
          startIcon={<FontAwesomeIcon icon={faCancel} />}
          variant="outlined"
        >
          Abort
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WipeDataDialog;
