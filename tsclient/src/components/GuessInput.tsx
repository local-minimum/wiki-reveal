import { faCirclePlay, faPlay, faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, IconButton, Stack, TextField, Tooltip, useMediaQuery, useTheme,
} from '@mui/material';
import * as React from 'react';
import { wordAsLexicalEntry } from '../utils/wiki';

interface GuessInputProps {
  isLoading: boolean;
  isError: boolean;
  isDone: boolean;
  unmasked: boolean;
  hints: number;
  freeWords: string[] | undefined;
  onAddGuess: (word: string) => void;
  onAddHint: () => void;
  compact?: boolean;
}

function GuessInput({
  isLoading, isError, isDone, unmasked, hints, onAddGuess, onAddHint, freeWords,
  compact = false,
}: GuessInputProps): JSX.Element {
  const [currentGuess, setCurrentGuess] = React.useState('');
  const theme = useTheme();
  const isExtraLarge = useMediaQuery(theme.breakpoints.up('xl'));
  const isFreeWord = currentGuess !== '' && freeWords?.includes(wordAsLexicalEntry(currentGuess));

  return (
    <Stack direction="row" gap={1}>
      <Tooltip title="Enter guess">
        <TextField
          sx={{ flex: 1 }}
          disabled={isLoading || isError || isDone || unmasked}
          variant="outlined"
          focused
          color={isFreeWord ? 'warning' : undefined}
          value={currentGuess}
          onChange={({ target: { value } }) => setCurrentGuess(value)}
          onKeyDown={({ key }) => {
            if (key === 'Enter' && currentGuess.length > 0 && !isFreeWord) {
              setCurrentGuess('');
              onAddGuess(currentGuess);
            }
          }}
          label={
            isFreeWord
              ? 'Free word given from start'
              : 'Guess'
          }
          spellCheck
          size={compact ? 'small' : 'medium'}
        />
      </Tooltip>
      <Tooltip title="Submit guess">
        {isExtraLarge ? (
          <Button
            variant="contained"
            onClick={() => onAddGuess(currentGuess)}
            startIcon={<FontAwesomeIcon icon={faPlay} />}
            disabled={isFreeWord || currentGuess.length === 0 || isDone || unmasked}
            size={compact ? 'small' : 'medium'}
          >
            Submit
          </Button>
        ) : (
          <IconButton
            onClick={() => onAddGuess(currentGuess)}
            color="primary"
            disabled={isFreeWord || currentGuess.length === 0 || isDone || unmasked}
            size={compact ? 'small' : 'medium'}
          >
            <FontAwesomeIcon icon={faCirclePlay} />
          </IconButton>
        )}
      </Tooltip>
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
    </Stack>
  );
}

export default GuessInput;
