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
  gameDuration: number | undefined;
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

function emojiGuesses(guesses: number): string {
  const guessString = `${guesses}`;
  return guessString.split('').map((ch) => {
    switch (ch) {
      case '0':
        return '0️⃣';
      case '1':
        return '1️⃣';
      case '2':
        return '2️⃣';
      case '3':
        return '3️⃣';
      case '4':
        return '4️⃣';
      case '5':
        return '5️⃣';
      case '6':
        return '6️⃣';
      case '7':
        return '7️⃣';
      case '8':
        return '8️⃣';
      case '9':
        return '9️⃣';
      default:
        return '';
    }
  }).join('');
}

function gameModeToText(
  gameMode: GameMode,
  hideToday = false,
): string {
  switch (gameMode) {
    case 'today':
      return hideToday ? '' : 'today\'s';
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

function humanFormatDuration(totalSeconds: number): string {
  const seconds = totalSeconds % 60;
  const minutes = (totalSeconds - seconds) / 60;

  if (minutes === 0) return `${seconds} ${pluralize('second', seconds)}`;
  if (seconds === 0) return `${minutes} ${pluralize('minute', minutes)}`;
  return `${minutes} ${pluralize('minute', minutes)} and ${seconds} ${pluralize('second', seconds)}`;
}

function addSpaceIfNotEmpty(stuff: string): string {
  if (stuff === '') return stuff;
  return `${stuff} `;
}

function Victory({
  hints, guesses, game, onRevealAll, accuracy, revealed, visible, onSetVisible,
  achievements, gameMode, unmasked, onUnrevealAll, gameName = 'Wiki Reveal', onShowStats,
  gameDuration,
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

    const msg = [
      `I solved ${gameName} in ${emojiGuesses(total)} ${pluralize('guess', total)}!`,
      hints === 0 ? null : `I needed ${emojiGuesses(hints)} ${pluralize('hint', hints)}!`,
      gameDuration == null ? null : `It took me ${humanFormatDuration(gameDuration)}.`,
      `My accuracy was ${accuracy.toFixed(1)}% revealing ${revealed.toFixed(1)}% of the article.`,
      nAchieve === 0 ? null : `${nAchieve} new ${pluralize('achievement', nAchieve)}!`,
      `Try ${addSpaceIfNotEmpty(gameModeToText(gameMode, true))}${gameName} (${String(game).slice(0, 6)}): ${window.location.href}`,
    ].filter((line) => line != null);

    navigator.clipboard.writeText(msg.join('\n'));
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
          <Typography gutterBottom>
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
          <Typography gutterBottom>
            Your accuracy was
            {` ${accuracy.toFixed(1)}`}
            % revealing
            {` ${revealed.toFixed(1)}`}
            % of the article.
          </Typography>
          {gameDuration != null && (
            <Typography>
              Solved in
              {' '}
              {humanFormatDuration(gameDuration)}
              .
            </Typography>
          )}
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
