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
  noScrollPage: boolean;
  boringHints: boolean;
  assistSpelling: boolean;
  wordCloud: boolean;
  numberHints: boolean;
}

export const defaultSettings: UserSettings = {
  mobileExtraBottom: false,
  allowHints: true,
  noScrollPage: false,
  autoScrollGuess: true,
  autoScrollGuessCoop: false,
  boringHints: false,
  assistSpelling: false,
  wordCloud: true,
  numberHints: true,
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
    autoScrollGuess, autoScrollGuessCoop, allowHints, mobileExtraBottom, boringHints,
    assistSpelling, noScrollPage, wordCloud, numberHints,
  } = userSettings;
  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>User Settings</DialogTitle>
      <DialogContent>
        <FormGroup>
          <FormControlLabel
            checked={assistSpelling}
            label="Spelling Assistance"
            control={<Switch />}
            onChange={() => onChangeUserSettings(
              { ...userSettings, assistSpelling: !assistSpelling },
            )}
          />
        </FormGroup>
        <Typography variant="caption">
          This will attempt some changes to what you entered and
          if there is a word in the article that is similar enough,
          then the most similar word will be chosen.
          Note that it does not know how to spell and may select other
          words than what you intended to input if your input was not
          present in the article.
        </Typography>
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
        <FormGroup>
          <FormControlLabel
            checked={boringHints}
            label="Include boring words in hints"
            control={<Switch />}
            onChange={() => onChangeUserSettings(
              { ...userSettings, boringHints: !boringHints },
            )}
          />
        </FormGroup>
        <Typography variant="caption">
          Boring hints (e.g. he, she, that, are, not...) are by default
          avoided even though they may be frequent.
          Enabling above treats them as any other word that could be hinted.
        </Typography>
        <FormGroup>
          <FormControlLabel
            checked={numberHints}
            label="Show length of hidden word"
            control={<Switch />}
            onChange={() => onChangeUserSettings(
              { ...userSettings, numberHints: !numberHints },
            )}
          />
        </FormGroup>
        <FormGroup>
          <FormControlLabel
            checked={wordCloud}
            label="Word Cloud (not on small screens)"
            control={<Switch />}
            onChange={() => onChangeUserSettings(
              { ...userSettings, wordCloud: !wordCloud },
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
            label="Auto-scroll to newest guess in guess table"
            control={<Switch />}
            onChange={() => onChangeUserSettings(
              { ...userSettings, autoScrollGuess: !autoScrollGuess },
            )}
          />
        </FormGroup>
        <FormGroup>
          <FormControlLabel
            checked={noScrollPage}
            label="Never scroll wiki page automatically"
            control={<Switch />}
            onChange={() => onChangeUserSettings(
              { ...userSettings, noScrollPage: !noScrollPage },
            )}
          />
        </FormGroup>
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          Coop Games
        </Typography>
        <FormGroup>
          <FormControlLabel
            checked={autoScrollGuessCoop}
            label="Auto-scroll to newest guess in guess table"
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
