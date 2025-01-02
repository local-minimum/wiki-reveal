import {
  faCirclePlay, faSpellCheck, faClockRotateLeft, faPen, faPlay, faPuzzlePiece,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
  Button, FormControl, IconButton, InputAdornment, InputLabel, InputProps,
  Menu, MenuItem, OutlinedInput, Stack,
  Tooltip, useMediaQuery, useTheme,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { wordAsLexicalEntry } from '../utils/wiki';
import { Guess } from './Guess';
import { UserSettings } from './menu/UserOptions';

interface GuessInputProps {
  isLoading: boolean;
  isError: boolean;
  isDone: boolean;
  isYesterday: boolean;
  unmasked: boolean;
  hints: number;
  guesses: Guess[];
  freeWords: string[] | undefined;
  onAddGuess: (word: string) => void;
  onAddMultiGuess: (words: string[]) => void;
  onAddHint: () => void;
  isCoop: boolean;
  allowCoopHints: boolean;
  compact?: boolean;
  latteralPad?: boolean;
  userSettings: UserSettings;
}

const INVALID = [' ', '-', '\'', '"', '_', '.', ':', ';', '\n', '\t', '\r'];

function wordLengthText(wordLength: number | undefined): string {
  if (wordLength == null || wordLength <= 3) return '';
  return ` [${wordLength}]`;
}

function labelText(
  isFreeWord: boolean | undefined,
  hasIllegal: boolean,
  isGuessed: boolean,
  wordLength: number | undefined,
): string {
  if (hasIllegal) return 'Includes illegal character';
  if (isFreeWord) return 'Free word given from start';
  if (isGuessed) return 'Already guessed';
  return `Guess${wordLengthText(wordLength)}`;
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

interface AutoGuess {
  name: string,
  guesses: string[],
}

const autoGuesses: AutoGuess[] = [
  {
    name: 'Verbs',
    guesses: ['are', 'were', 'be', 'being', 'have', 'has', 'had', 'make'],
  },
  {
    name: 'Numbers',
    guesses: ['zero', 'one', 'two', 'three', 'four', 'first', 'second', 'third', '0', '000', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'i', 'ii'],
  },
  {
    name: 'Pronouns',
    guesses: ['he', 'him', 'his', 'she', 'her', 'hers', 'its', 'them', 'they', 'these', 'those', 'we'],
  },
  {
    name: 'Letters',
    guesses: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
  },
  {
    name: 'This, That...',
    guesses: ['this', 'that', 'there', 'then'],
  },
  {
    name: 'Which, Where...',
    guesses: ['which', 'where', 'when', 'who', 'while', 'how'],
  },
  {
    name: 'Comparisons',
    guesses: ['many', 'more', 'most', 'few', 'some'],
  },
  {
    name: 'Directions',
    guesses: ['north', 'south', 'west', 'east', 'central', 'northwest', 'northeast', 'southeast', 'southwest', 'northern', 'western', 'eastern', 'southern'],
  },
  {
    name: 'Centuries',
    guesses: ['century', 'centuries', '10th', '11th', '12th', '13th', '14th', '15th', '16th', '17th', '18th', '19th', '20th', '21st'],
  },
];

function startAdornment(isYesterday: boolean, usesSpellCheck: boolean): JSX.Element | undefined {
  const icons = [];
  if (isYesterday) {
    icons.push((
      <Tooltip title="Playing yesterday's game">
        <FontAwesomeIcon icon={faClockRotateLeft} />
      </Tooltip>
    ));
  }

  if (usesSpellCheck) {
    icons.push((
      <Tooltip title="Spell assist activated">
        <FontAwesomeIcon icon={faSpellCheck} />
      </Tooltip>
    ));
  }

  if (icons.length === 0) return undefined;

  return (
    <InputAdornment position="start">
      <Stack gap={0.5} direction="row">
        {icons}
      </Stack>
    </InputAdornment>
  );
}

function GuessInput({
  isLoading, isError, isDone, unmasked, hints, onAddGuess, onAddHint, freeWords,
  isCoop, userSettings, compact = false, latteralPad = false, allowCoopHints, guesses, isYesterday,
  onAddMultiGuess,
}: GuessInputProps): JSX.Element {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const isExtraLarge = useMediaQuery(theme.breakpoints.up('xl'));

  const [currentGuess, setCurrentGuess] = React.useState('');
  const cleanCurrentGuess = currentGuess.trimEnd();

  const { allowHints } = userSettings;

  const lex = wordAsLexicalEntry(cleanCurrentGuess);
  const isFreeWord = cleanCurrentGuess !== '' && lex !== null && freeWords?.includes(lex);
  const hasIllegal = INVALID.some((sub) => lex !== null && lex.includes(sub));
  const isGuessed = guesses.find(([guessLex]) => guessLex === lex) !== undefined;

  const filteredAutoguesses = autoGuesses
    .map(({ name, guesses: aGuesses }) => ({
      name,
      guesses: aGuesses.filter((g) => !freeWords?.some((w) => w === g)
        && !guesses.some(([guessesLex]) => g === guessesLex)),
    }));

  const [autoGuessAnchorEl, setAutoGuessAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(autoGuessAnchorEl);
  const handleAutoGuessClick = (newGuesses: string[]) => {
    setAutoGuessAnchorEl(null);
    onAddMultiGuess(newGuesses);
  };
  const handleShowAutoGuess = (event: React.MouseEvent<HTMLElement>) => {
    setAutoGuessAnchorEl(event.currentTarget);
  };
  const handleCloseAutoGuess = () => {
    setAutoGuessAnchorEl(null);
  };

  const inputLabel = labelText(isFreeWord, hasIllegal, isGuessed, cleanCurrentGuess.length);
  const usesSpellCheck = userSettings.assistSpelling;

  return (
    <Stack direction="row" gap={1} sx={latteralPad ? { marginLeft: 0.5, marginRight: 0.5 } : undefined}>
      <FormControl sx={{ flex: 1 }}>
        <InputLabel htmlFor="guess-input-field">{inputLabel}</InputLabel>
        <OutlinedInput
          id="guess-input-field"
          type="text"
          sx={{ '& legend': { visibility: 'visible' } }}
          disabled={isLoading || isError || isDone || unmasked}
          autoFocus
          color={inputColor(isFreeWord, hasIllegal, isGuessed)}
          value={currentGuess}
          onChange={({ target: { value } }) => setCurrentGuess(parseInput(value))}
          onKeyDown={({ key }) => {
            if (key === 'Enter' && cleanCurrentGuess.length > 0) {
              if (!isFreeWord && !hasIllegal) {
                setCurrentGuess('');
                onAddGuess(cleanCurrentGuess);
              } else if (isFreeWord) {
                setCurrentGuess('');
                enqueueSnackbar('Word given for free', { variant: 'info' });
              } else {
                enqueueSnackbar('Word contains forbidden character', { variant: 'warning' });
              }
            } else if (key === 'Enter') {
              enqueueSnackbar('Focusing word', { variant: 'info' });
            } else if (key === 'ArrowUp') {
              enqueueSnackbar('Focusing previous', { variant: 'info' });
            } else if (key === 'ArrowDown') {
              enqueueSnackbar('Focusing next', { variant: 'info' });
            }
          }}
          label={inputLabel}
          spellCheck
          size={compact ? 'small' : 'medium'}
          startAdornment={startAdornment(isYesterday, usesSpellCheck)}
          endAdornment={(
            <InputAdornment position="end">
              <IconButton aria-label="automatic-guessing" edge="end" onClick={handleShowAutoGuess}>
                <FontAwesomeIcon icon={faPen} />
              </IconButton>
            </InputAdornment>
        )}
        />
      </FormControl>
      <Menu
        anchorEl={autoGuessAnchorEl}
        open={open}
        onClose={handleCloseAutoGuess}
      >
        {filteredAutoguesses.map(({ name, guesses: aGuesses }) => (
          <Tooltip key={name} title={`Guesses: ${aGuesses.join(', ')}`} arrow>
            <MenuItem
              disabled={aGuesses.length === 0}
              onClick={() => handleAutoGuessClick(aGuesses)}
            >
              {`[${aGuesses.length}] ${name}`}
            </MenuItem>
          </Tooltip>
        ))}
        <Alert variant="outlined" severity="info" sx={{ maxWidth: '250px', m: 1 }}>
          Guess a predefined group of guesses at once (number of new guesses within brackets)
          so you don&apos;t have to type them all out. Hover each to see the exact guesses.
        </Alert>
      </Menu>
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
