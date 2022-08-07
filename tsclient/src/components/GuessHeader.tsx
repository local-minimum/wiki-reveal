import * as React from 'react';
import {
  Badge, Box,
  Tooltip, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
import { usersToText } from './menu/usersToText';

interface GuessHeaderProps {
  accuracy: number;
  guesses: number;
  isCoop: boolean;
  coopUsers: string[];
}

function GuessHeader({
  accuracy, guesses, isCoop, coopUsers,
}: GuessHeaderProps): JSX.Element | null {
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
      {isCoop && coopUsers.length > 0 && (
        <Box component="span" sx={{ marginLeft: 1 }}>
          <Tooltip title={usersToText(coopUsers)}>
            <Badge badgeContent={coopUsers.length} color="primary">
              <FontAwesomeIcon icon={faPeopleGroup} />
            </Badge>
          </Tooltip>
        </Box>
      )}
    </Typography>

  );
}

export default GuessHeader;
