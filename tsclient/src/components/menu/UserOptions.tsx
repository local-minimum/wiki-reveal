import * as React from 'react';
import {
  Button,
  Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, FormGroup, Slider, Switch, Typography,
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
  hideTimer: boolean;
  wikiFontSize: number;
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
  hideTimer: false,
  wikiFontSize: 14,
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
    assistSpelling, noScrollPage, wordCloud, numberHints, hideTimer, wikiFontSize,
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
        <Typography variant="caption" gutterBottom>
          This will attempt to slightly alter what you entered so that
          if there is a similar enought word in the article,
          then it will be chosen.
          Note that it does not know how to spell and may select other
          words than what you intended, if your input was not
          present in the article.
        </Typography>
        <FormGroup>
          <Typography id="font-size-slider">Wiki font size</Typography>
          <Slider
            min={6}
            max={30}
            step={1}
            value={wikiFontSize}
            onChange={(_, value) => {
              if (typeof value === 'number') {
                onChangeUserSettings({ ...userSettings, wikiFontSize: value });
              }
            }}
            aria-labelledby="font-size-slider"
          />
        </FormGroup>
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
          Boring hints (e.g. he, she, that...) are avoided by default.
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
        <FormGroup>
          <FormControlLabel
            checked={hideTimer}
            label="Hide timer while playing"
            control={<Switch />}
            onChange={() => onChangeUserSettings(
              { ...userSettings, hideTimer: !hideTimer },
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
