import * as React from 'react';
import {
  Tooltip, Typography, useMediaQuery, useTheme,
} from '@mui/material';

interface GuessHeaderProps {
  accuracy: number;
  guesses: number;
}

function GuessHeader({ accuracy, guesses }: GuessHeaderProps): JSX.Element | null {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  if (isSmall) return null;

  return (
    <Typography variant="h6">
      {`${guesses} Guess${guesses === 1 ? '' : 'es'}`}
      <Tooltip title="Percent guesses included in the article, disregarding hints">
        <span>
          {` (${accuracy.toFixed(1)}% accuracy)`}
        </span>
      </Tooltip>
    </Typography>

  );
}

export default GuessHeader;
