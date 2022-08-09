import {
  faEye, faEyeSlash, faShare, faX,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { GameMode } from '../api/page';
import {
  Achievement, AchievementsType, achievementToColor, achievementToIcon, achievementToTitle, Game,
} from '../utils/achievements';
import { pluralize } from '../utils/plural';
import { SingleAchievement } from './menu/SingleAchievement';

interface VictoryProps {
  hints: number;
  guesses: number;
  accuracy: number;
  revealed: number;
  game: Game | undefined;
  onRevealAll: () => void;
  onUnrevealAll: () => void;
  unmasked: boolean;
  visible: boolean;
  onSetVisible: (visible: boolean) => void;
  achievements: AchievementsType;
  gameMode: GameMode;
}

function gameModeToText(gameMode: GameMode): string {
  switch (gameMode) {
    case 'today':
      return 'today\'s';
    case 'yesterday':
      return 'yesterday\'s';
    case 'coop':
      return 'a coop';
    default:
      return '';
  }
}

function Victory({
  hints, guesses, game, onRevealAll, accuracy, revealed, visible, onSetVisible,
  achievements, gameMode, unmasked, onUnrevealAll,
}: VictoryProps): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const newAchievements = Object
    .values(Achievement)
    .filter((achievement) => achievements[achievement] === game);

  const total = guesses + hints;

  const handleShare = () => {
    const nAchieve = newAchievements.length;
    const hasAchievements = nAchieve === 0 ? '' : ` earning me ${nAchieve} new ${pluralize('achievement', nAchieve)}`;
    const msg = `I solved ${gameModeToText(gameMode)} Wiki-Reveal ${String(game).slice(0, 6)} in ${total} ${pluralize('guess', total)} using ${hints} ${pluralize('hint', hints)}!
My accuracy was ${accuracy.toFixed(1)}% revealing ${revealed.toFixed(1)}% of the article${hasAchievements}.`;
    navigator.clipboard.writeText(msg);
    enqueueSnackbar('Copied message to clipboard', { variant: 'info' });
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
            You solved
            {' '}
            {gameModeToText(gameMode)}
            {' '}
            challenge (#
            {game ?? '??'}
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
                    game={achievements[achievement]}
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
            if (unmasked) {
              onUnrevealAll();
            } else {
              onRevealAll();
            }
            onSetVisible(false);
          }}
          startIcon={<FontAwesomeIcon icon={unmasked ? faEyeSlash : faEye} />}
        >
          {unmasked ? 'Un-' : ''}
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
