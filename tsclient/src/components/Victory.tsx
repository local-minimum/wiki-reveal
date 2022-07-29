import { faEye, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert, AlertTitle, Button, Popper, Stack,
} from '@mui/material';
import * as React from 'react';

interface VictoryProps {
  hints: number;
  guesses: number;
  onRevealAll: () => void;
}

function Victory({ hints, guesses, onRevealAll }: VictoryProps): JSX.Element {
  const [hidden, setHidden] = React.useState(false);

  return (
    <Popper
      open={!hidden}
      sx={{
        zIndex: 1000,
        marginTop: 10,
        marginLeft: '40px',
        right: 40,
        backgroundColor: '#EFD9CE',
        padding: 5,
      }}
      placement="top"
      popperOptions={{ strategy: 'fixed' }}
    >
      <Alert
        severity="success"
        variant="outlined"
        sx={{ mb: 1 }}
        action={(
          <Stack direction="column" gap={1}>
            <Button
              variant="outlined"
              onClick={() => {
                onRevealAll();
                setHidden(true);
              }}
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
    </Popper>
  );
}

export default Victory;
