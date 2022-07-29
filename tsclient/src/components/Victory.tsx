import { faEye, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert, AlertTitle, Button, Stack,
} from '@mui/material';
import * as React from 'react';

interface VictoryProps {
  hints: number;
  guesses: number;
  onRevealAll: () => void;
}

function Victory({ hints, guesses, onRevealAll }: VictoryProps): JSX.Element | null {
  const [hidden, setHidden] = React.useState(false);

  if (hidden) return null;

  return (
    <Alert
      severity="success"
      sx={{ mb: 1 }}
      action={(
        <Stack direction="row" gap={1}>
          <Button
            variant="outlined"
            onClick={onRevealAll}
            startIcon={<FontAwesomeIcon icon={faEye} />}
          >
            Reveal
          </Button>
          <Button
            variant="outlined"
            onClick={() => setHidden(true)}
            startIcon={<FontAwesomeIcon icon={faX} />}
          >
            Close
          </Button>
        </Stack>
      )}
    >
      <AlertTitle>Congratulations!</AlertTitle>
      You solved today&apos;s challenge in
      {` ${guesses + hints} guess${(guesses + hints) === 1 ? '' : 'es'}`}
      {` ${hints} of which were hint${hints === 1 ? '' : 's'}`}
      . You may continue guessing words to your heart&apos;s content.
    </Alert>
  );
}

export default Victory;
