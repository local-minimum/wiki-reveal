import {
  faBarChart,
  faEye, faEyeSlash, faShareNodes, faX,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Grid, IconButton, Typography, useMediaQuery, useTheme,
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
  gameName?: string;
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
  onShowStats: () => void;
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

interface ResponsiveButtonProps {
  icon: FontAwesomeIconProps['icon'];
  title: string;
  onClick: () => void;
  isSmallish?: boolean;
}

function ResponsiveButton({
  icon, title, onClick, isSmallish = false,
}: ResponsiveButtonProps): JSX.Element {
  if (isSmallish) {
    return (
      <IconButton color="primary" title={title} onClick={onClick}>
        <FontAwesomeIcon icon={icon} />
      </IconButton>
    );
  }

  return (
    <Button
      variant="outlined"
      onClick={onClick}
      startIcon={<FontAwesomeIcon icon={icon} />}
    >
      {title}
    </Button>
  );
}

function Victory({
  hints, guesses, game, onRevealAll, accuracy, revealed, visible, onSetVisible,
  achievements, gameMode, unmasked, onUnrevealAll, gameName = 'Wiki Reveal', onShowStats,
}: VictoryProps): JSX.Element {
  const theme = useTheme();
  const isSmallish = useMediaQuery(theme.breakpoints.down('md'));

  const { enqueueSnackbar } = useSnackbar();
  const newAchievements = Object
    .values(Achievement)
    .filter((achievement) => achievements[achievement] === game);

  const total = guesses + hints;

  const handleShare = () => {
    const nAchieve = newAchievements.length;
    const hasAchievements = nAchieve === 0 ? '' : ` earning me ${nAchieve} new ${pluralize('achievement', nAchieve)}`;
    const msg = `I solved ${gameModeToText(gameMode)} ${gameName} ${String(game).slice(0, 6)} in ${total} ${pluralize('guess', total)} using ${hints} ${pluralize('hint', hints)}!
My accuracy was ${accuracy.toFixed(1)}% revealing ${revealed.toFixed(1)}% of the article${hasAchievements}. ${window.location.href}`;
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
            challenge
            {` ${String(game).slice(0, 6) ?? '??'} `}
            in
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
        <ResponsiveButton title="Stats" onClick={onShowStats} icon={faBarChart} isSmallish={isSmallish} />
        <ResponsiveButton title="Share" onClick={handleShare} icon={faShareNodes} isSmallish={isSmallish} />
        <ResponsiveButton
          title={unmasked ? 'Un-Reveal' : 'Reveal'}
          onClick={() => {
            if (unmasked) {
              onUnrevealAll();
            } else {
              onRevealAll();
            }
            onSetVisible(false);
          }}
          icon={unmasked ? faEyeSlash : faEye}
          isSmallish={isSmallish}
        />
        <ResponsiveButton
          title="Close"
          onClick={() => onSetVisible(false)}
          icon={faX}
          isSmallish={isSmallish}
        />
      </DialogActions>
    </Dialog>
  );
}

export default Victory;
