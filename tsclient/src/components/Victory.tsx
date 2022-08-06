import { faEye, faShare, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Typography,
} from '@mui/material';
import * as React from 'react';
import {
  Achievement, AchievementsType, achievementToColor, achievementToIcon, achievementToTitle,
} from '../utils/achievements';
import { pluralize } from '../utils/plural';
import { SingleAchievement } from './menu/SingleAchievement';

interface VictoryProps {
  hints: number;
  guesses: number;
  accuracy: number;
  revealed: number;
  gameId: number | undefined;
  onRevealAll: () => void;
  visible: boolean;
  onSetVisible: (visible: boolean) => void;
  achievements: AchievementsType;
}

function Victory({
  hints, guesses, gameId, onRevealAll, accuracy, revealed, visible, onSetVisible,
  achievements,
}: VictoryProps): JSX.Element {
  const newAchievements = Object
    .values(Achievement)
    .filter((achievement) => achievements[achievement] === gameId);

  const total = guesses + hints;

  const handleShare = () => {
    const nAchieve = newAchievements.length;
    const hasAchievements = nAchieve === 0 ? '' : ` earning me ${nAchieve} new ${pluralize('achievement', nAchieve)}`;
    const msg = `I solved Wiki-Reveal #${gameId} in ${total} ${pluralize('guess', total)} using ${hints} ${pluralize('hint', hints)}!
My accuracy was ${accuracy.toFixed(1)}% revealing ${revealed.toFixed(1)}% of the article${hasAchievements}.`;
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
            {` ${total} ${pluralize('guess', total)}`}
            {` using ${hints} ${pluralize('hint', hints)}!`}
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
        <Grid container alignItems="stretch">
          {newAchievements
            .sort((a, b) => (a < b ? -1 : 1))
            .map((achievement) => {
              const [title, description] = achievementToTitle(achievement);
              return (
                <Grid key={achievement} item lg={3} md={4} xs={6}>
                  <SingleAchievement
                    gameId={achievements[achievement]}
                    icon={achievementToIcon(achievement)}
                    title={title}
                    description={description}
                    color={achievementToColor(achievement)}
                  />
                </Grid>
              );
            })}
        </Grid>
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
