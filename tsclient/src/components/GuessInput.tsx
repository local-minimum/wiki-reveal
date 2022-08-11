import { faCirclePlay, faPlay, faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, IconButton, Stack, TextField, Tooltip, useMediaQuery, useTheme,
} from '@mui/material';
import * as React from 'react';
import { wordAsLexicalEntry } from '../utils/wiki';
import { UserSettings } from './menu/UserOptions';

interface GuessInputProps {
  isLoading: boolean;
  isError: boolean;
  isDone: boolean;
  unmasked: boolean;
  hints: number;
  freeWords: string[] | undefined;
  onAddGuess: (word: string) => void;
  onAddHint: () => void;
  isCoop: boolean;
  compact?: boolean;
  latteralPad?: boolean;
  userSettings: UserSettings;
}

const INVALID = [' ', '-', '\'', '"', '_', '.', ':', ';', '\n', '\t', '\r'];

function labelText(isFreeWord: boolean | undefined, hasIllegal: boolean): string {
  if (hasIllegal) return 'Includes illegal character';
  if (isFreeWord) return 'Free word given from start';
  return 'Guess';
}

function GuessInput({
  isLoading, isError, isDone, unmasked, hints, onAddGuess, onAddHint, freeWords,
  isCoop, userSettings, compact = false, latteralPad = false,
}: GuessInputProps): JSX.Element {
  const { allowHints } = userSettings;
  const [currentGuess, setCurrentGuess] = React.useState('');
  const theme = useTheme();
  const isExtraLarge = useMediaQuery(theme.breakpoints.up('xl'));
  const lex = wordAsLexicalEntry(currentGuess);
  const isFreeWord = currentGuess !== '' && freeWords?.includes(lex);
  const hasIllegal = INVALID.some((sub) => lex.includes(sub));
  return (
    <Stack direction="row" gap={1} sx={latteralPad ? { marginLeft: 0.5, marginRight: 0.5 } : undefined}>
      <Tooltip title="Enter guess">
        <TextField
          sx={{ flex: 1 }}
          disabled={isLoading || isError || isDone || unmasked}
          variant="outlined"
          focused
          color={isFreeWord || hasIllegal ? 'warning' : undefined}
          value={currentGuess}
          onChange={({ target: { value } }) => setCurrentGuess(value.replace(/\s/g, ''))}
          onKeyDown={({ key }) => {
            if (key === 'Enter' && currentGuess.length > 0 && !isFreeWord && !hasIllegal) {
              setCurrentGuess('');
              onAddGuess(currentGuess);
            }
          }}
          label={labelText(isFreeWord, hasIllegal)}
          spellCheck
          size={compact ? 'small' : 'medium'}
        />
      </Tooltip>
      <Tooltip title="Submit guess">
        {isExtraLarge ? (
          <Button
            variant="contained"
            onClick={() => { onAddGuess(currentGuess); setCurrentGuess(''); }}
            startIcon={<FontAwesomeIcon icon={faPlay} />}
            disabled={isFreeWord || currentGuess.length === 0 || isDone || unmasked}
            size={compact ? 'small' : 'medium'}
          >
            Submit
          </Button>
        ) : (
          <IconButton
            onClick={() => { onAddGuess(currentGuess); setCurrentGuess(''); }}
            color="primary"
            disabled={isFreeWord || currentGuess.length === 0 || isDone || unmasked}
            size={compact ? 'small' : 'medium'}
          >
            <FontAwesomeIcon icon={faCirclePlay} />
          </IconButton>
        )}
      </Tooltip>
      {!isCoop && allowHints && (
        <Tooltip title="Get a word for free that is not in the main header">
          {isExtraLarge ? (
            <Button
              variant="contained"
              color="secondary"
              onClick={onAddHint}
              startIcon={<FontAwesomeIcon icon={faPuzzlePiece} />}
              disabled={isDone || unmasked}
              size={compact ? 'small' : 'medium'}
            >
              {`${hints} Hint${hints === 1 ? '' : 's'}`}
            </Button>
          ) : (
            <IconButton
              onClick={onAddHint}
              disabled={isDone || unmasked}
              color="secondary"
              size={compact ? 'small' : 'medium'}
            >
              <FontAwesomeIcon icon={faPuzzlePiece} />
            </IconButton>
          )}
        </Tooltip>
      )}
    </Stack>
  );
}

export default GuessInput;
