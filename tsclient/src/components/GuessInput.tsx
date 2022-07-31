import { faPlay, faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Stack, TextField, Tooltip,
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
}

function GuessInput({
  isLoading, isError, isDone, unmasked, hints, onAddGuess, onAddHint, freeWords,
}: GuessInputProps): JSX.Element {
  const [currentGuess, setCurrentGuess] = React.useState('');

  return (
    <Stack direction="row" gap={1}>
      <Tooltip title="Enter guess">
        <TextField
          sx={{ flex: 1 }}
          disabled={isLoading || isError || isDone || unmasked}
          variant="outlined"
          focused
          value={currentGuess}
          onChange={({ target: { value } }) => setCurrentGuess(value)}
          onKeyDown={({ key }) => {
            if (key === 'Enter' && currentGuess.length > 0) {
              setCurrentGuess('');
              onAddGuess(currentGuess);
            }
          }}
          label={
            currentGuess !== '' && freeWords?.includes(wordAsLexicalEntry(currentGuess))
              ? 'Free word given from start'
              : 'Guess'
          }
        />
      </Tooltip>
      <Tooltip title="Submit guess">
        <Button
          variant="contained"
          onClick={() => onAddGuess(currentGuess)}
          startIcon={<FontAwesomeIcon icon={faPlay} />}
          disabled={currentGuess.length === 0 || isDone || unmasked}
        >
          Submit
        </Button>
      </Tooltip>
      <Tooltip title="Get a word for free that is not in the main header">
        <Button
          variant="contained"
          onClick={onAddHint}
          startIcon={<FontAwesomeIcon icon={faPuzzlePiece} />}
          disabled={isDone || unmasked}
        >
          {`${hints} Hint${hints === 1 ? '' : 's'}`}
        </Button>
      </Tooltip>
    </Stack>
  );
}

export default GuessInput;
