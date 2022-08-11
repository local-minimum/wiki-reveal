import * as React from 'react';
import {
  Button,
  Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, FormGroup, Switch, Typography,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

export interface UserSettings {
  mobileExtraBottom: boolean;
  allowHints: boolean;
  autoScrollGuess: boolean;
  autoScrollGuessCoop: boolean;
}

export const defaultSettings: UserSettings = {
  mobileExtraBottom: false,
  allowHints: true,
  autoScrollGuess: true,
  autoScrollGuessCoop: false,
};

interface UserOptionsProps {
  onClose: () => void;
  userSettings: UserSettings;
  onChangeUserSettings: (settings: UserSettings) => void;
}

function UserOptions({
  onClose, userSettings, onChangeUserSettings,
}: UserOptionsProps): JSX.Element {
  const {
    autoScrollGuess, autoScrollGuessCoop, allowHints, mobileExtraBottom,
  } = userSettings;
  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>User Settings</DialogTitle>
      <DialogContent>
        <FormGroup>
          <FormControlLabel
            checked={mobileExtraBottom}
            label="Extra bottom padding for iPhone?"
            control={<Switch />}
            onChange={() => onChangeUserSettings(
              { ...userSettings, mobileExtraBottom: !mobileExtraBottom },
            )}
          />
        </FormGroup>
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          Solo Games
        </Typography>
        <FormGroup>
          <FormControlLabel
            checked={allowHints}
            label="Allow hints"
            control={<Switch />}
            onChange={() => onChangeUserSettings(
              { ...userSettings, allowHints: !allowHints },
            )}
          />
        </FormGroup>
        <FormGroup>
          <FormControlLabel
            checked={autoScrollGuess}
            label="Auto-scroll to newest guess"
            control={<Switch />}
            onChange={() => onChangeUserSettings(
              { ...userSettings, autoScrollGuess: !autoScrollGuess },
            )}
          />
        </FormGroup>
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          Coop Games
        </Typography>
        <FormGroup>
          <FormControlLabel
            checked={autoScrollGuessCoop}
            label="Auto-scroll to newest guess"
            control={<Switch />}
            onChange={() => onChangeUserSettings(
              { ...userSettings, autoScrollGuessCoop: !autoScrollGuessCoop },
            )}
          />
        </FormGroup>
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

export default UserOptions;
