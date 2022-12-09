import { faCirclePlay, faPlay, faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, IconButton, InputProps, Stack, TextField, Tooltip, useMediaQuery, useTheme,
} from '@mui/material';
import * as React from 'react';
import { wordAsLexicalEntry } from '../utils/wiki';
import { Guess } from './Guess';
import { UserSettings } from './menu/UserOptions';

interface GuessInputProps {
  isLoading: boolean;
  isError: boolean;
  isDone: boolean;
  unmasked: boolean;
  hints: number;
  guesses: Guess[];
  freeWords: string[] | undefined;
  onAddGuess: (word: string) => void;
  onAddHint: () => void;
  isCoop: boolean;
  allowCoopHints: boolean;
  compact?: boolean;
  latteralPad?: boolean;
  userSettings: UserSettings;
}

const INVALID = [' ', '-', '\'', '"', '_', '.', ':', ';', '\n', '\t', '\r'];

function labelText(
  isFreeWord: boolean | undefined,
  hasIllegal: boolean,
  isGuessed: boolean,
): string {
  if (hasIllegal) return 'Includes illegal character';
  if (isFreeWord) return 'Free word given from start';
  if (isGuessed) return 'Already guessed';
  return 'Guess';
}

function inputColor(
  isFreeWord: boolean | undefined,
  hasIllegal: boolean,
  isGuessed: boolean,
): InputProps['color'] {
  if (isFreeWord || hasIllegal) return 'warning';
  if (isGuessed) return 'secondary';
  return undefined;
}

function parseInput(rawInput: string): string {
  const candidate = rawInput.match(/\S+ ?/);
  if (candidate == null) return '';
  return candidate[0] ?? '';
}

function GuessInput({
  isLoading, isError, isDone, unmasked, hints, onAddGuess, onAddHint, freeWords,
  isCoop, userSettings, compact = false, latteralPad = false, allowCoopHints, guesses,
}: GuessInputProps): JSX.Element {
  const { allowHints } = userSettings;
  const [currentGuess, setCurrentGuess] = React.useState('');
  const cleanCurrentGuess = currentGuess.trimEnd();
  const theme = useTheme();
  const isExtraLarge = useMediaQuery(theme.breakpoints.up('xl'));
  const lex = wordAsLexicalEntry(cleanCurrentGuess);
  const isFreeWord = cleanCurrentGuess !== '' && lex !== null && freeWords?.includes(lex);
  const hasIllegal = INVALID.some((sub) => lex !== null && lex.includes(sub));
  const isGuessed = guesses.find(([guessLex]) => guessLex === lex) !== undefined;

  return (
    <Stack direction="row" gap={1} sx={latteralPad ? { marginLeft: 0.5, marginRight: 0.5 } : undefined}>
      <Tooltip title="Enter guess">
        <TextField
          sx={{ flex: 1 }}
          disabled={isLoading || isError || isDone || unmasked}
          variant="outlined"
          focused
          color={inputColor(isFreeWord, hasIllegal, isGuessed)}
          value={currentGuess}
          onChange={({ target: { value } }) => setCurrentGuess(parseInput(value))}
          onKeyDown={({ key }) => {
            if (key === 'Enter' && cleanCurrentGuess.length > 0 && !isFreeWord && !hasIllegal) {
              setCurrentGuess('');
              onAddGuess(cleanCurrentGuess);
            }
          }}
          label={labelText(isFreeWord, hasIllegal, isGuessed)}
          spellCheck
          size={compact ? 'small' : 'medium'}
        />
      </Tooltip>
      <Tooltip title="Submit guess">
        {isExtraLarge ? (
          <Button
            variant="contained"
            onClick={() => { onAddGuess(cleanCurrentGuess); setCurrentGuess(''); }}
            startIcon={<FontAwesomeIcon icon={faPlay} />}
            disabled={isFreeWord || cleanCurrentGuess.length === 0 || isDone || unmasked}
            size={compact ? 'small' : 'medium'}
          >
            Submit
          </Button>
        ) : (
          <IconButton
            onClick={() => { onAddGuess(cleanCurrentGuess); setCurrentGuess(''); }}
            color="primary"
            disabled={isFreeWord || cleanCurrentGuess.length === 0 || isDone || unmasked}
            size={compact ? 'small' : 'medium'}
          >
            <FontAwesomeIcon icon={faCirclePlay} />
          </IconButton>
        )}
      </Tooltip>
      {!(isCoop && !allowCoopHints) && allowHints && (
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
