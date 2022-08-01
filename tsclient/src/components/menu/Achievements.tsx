import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';
import * as React from 'react';

interface AchievementsProps {
  onClose: () => void;
}

function Achievements({ onClose }: AchievementsProps): JSX.Element {
  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Achievements</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This is where you&apos;ll see your achievements as soon as I&apos;ve
          created them...
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

export default Achievements;
