import { faEye, faShare, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert, AlertTitle, Button, Popper, Stack,
} from '@mui/material';
import * as React from 'react';

interface VictoryProps {
  hints: number;
  guesses: number;
  accuracy: number;
  revealed: number;
  gameId: number | undefined;
  onRevealAll: () => void;
}

function Victory({
  hints, guesses, gameId, onRevealAll, accuracy, revealed,
}: VictoryProps): JSX.Element {
  const [hidden, setHidden] = React.useState(false);

  const handleShare = () => {
    const total = guesses + hints;
    const msg = `I solved Wiki-Reveal #${gameId} in ${total} guess${total === 1 ? '' : 'es'} using ${hints} hint${hints === 1 ? '' : 's'}!
My accuracy was ${accuracy.toFixed(1)}% revealing ${revealed.toFixed(1)}% of the article.`;
    navigator.clipboard.writeText(msg);
  };

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
              onClick={handleShare}
              startIcon={<FontAwesomeIcon icon={faShare} />}
            >
              Share
            </Button>
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
        <p>
          You solved today&apos;s challenge (#
          {gameId ?? '??'}
          ) in
          {` ${guesses + hints} guess${(guesses + hints) === 1 ? '' : 'es'}`}
          {` using ${hints} hint${hints === 1 ? '' : 's'}!`}
        </p>
        <p>
          Your accuracy was
          {` ${accuracy.toFixed(1)}`}
          % revealing
          {` ${revealed.toFixed(1)}`}
          % of the article.
        </p>
        <p>
          You may continue guessing words to your heart&apos;s content.
        </p>
      </Alert>
    </Popper>
  );
}

export default Victory;
