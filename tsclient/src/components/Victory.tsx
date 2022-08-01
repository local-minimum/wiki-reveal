import { faEye, faShare, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography,
} from '@mui/material';
import * as React from 'react';

interface VictoryProps {
  hints: number;
  guesses: number;
  accuracy: number;
  revealed: number;
  gameId: number | undefined;
  onRevealAll: () => void;
  visible: boolean;
  onSetVisible: (visible: boolean) => void;
}

function Victory({
  hints, guesses, gameId, onRevealAll, accuracy, revealed, visible, onSetVisible,
}: VictoryProps): JSX.Element {
  const handleShare = () => {
    const total = guesses + hints;
    const msg = `I solved Wiki-Reveal #${gameId} in ${total} guess${total === 1 ? '' : 'es'} using ${hints} hint${hints === 1 ? '' : 's'}!
My accuracy was ${accuracy.toFixed(1)}% revealing ${revealed.toFixed(1)}% of the article.`;
    navigator.clipboard.writeText(msg);
  };

  return (
    <Dialog
      open={visible}
      onClose={() => onSetVisible(false)}
    >
      <DialogTitle>
        Congratulations!
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography>
            You solved today&apos;s challenge (#
            {gameId ?? '??'}
            ) in
            {` ${guesses + hints} guess${(guesses + hints) === 1 ? '' : 'es'}`}
            {` using ${hints} hint${hints === 1 ? '' : 's'}!`}
          </Typography>
          <Typography>
            Your accuracy was
            {` ${accuracy.toFixed(1)}`}
            % revealing
            {` ${revealed.toFixed(1)}`}
            % of the article.
          </Typography>
          <Typography>
            You may continue guessing words to your heart&apos;s content.
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
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
            onSetVisible(false);
          }}
          startIcon={<FontAwesomeIcon icon={faEye} />}
        >
          Reveal
        </Button>
        <Button
          variant="outlined"
          onClick={() => onSetVisible(false)}
          startIcon={<FontAwesomeIcon icon={faX} />}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default Victory;
