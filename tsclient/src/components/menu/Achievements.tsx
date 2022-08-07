import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, useMediaQuery, useTheme,
} from '@mui/material';
import * as React from 'react';
import {
  Achievement, AchievementsType, achievementToColor, achievementToIcon, achievementToTitle,
} from '../../utils/achievements';
import { SingleAchievement } from './SingleAchievement';

interface AchievementsProps {
  onClose: () => void;
  achievements: AchievementsType;
}

function Achievements({ onClose, achievements }: AchievementsProps): JSX.Element {
  const theme = useTheme();
  const isXL = useMediaQuery(theme.breakpoints.only('xl'));
  const isSmallish = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog open onClose={onClose} maxWidth={isXL ? 'lg' : 'md'} fullWidth={isSmallish}>
      <DialogTitle>Achievements</DialogTitle>
      <DialogContent>
        <Grid container alignItems="stretch">
          {Object
            .values(Achievement)
            .sort((a, b) => (a < b ? -1 : 1))
            .map((achievement) => {
              const [title, description] = achievementToTitle(achievement);
              return (
                <Grid key={achievement} item lg={2} md={3} sm={4} xs={6}>
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
          onClick={onClose}
          startIcon={<FontAwesomeIcon icon={faClose} />}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default Achievements;
