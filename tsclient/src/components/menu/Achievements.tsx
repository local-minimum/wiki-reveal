import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCircleQuestion, faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Grid, Tooltip, Typography,
} from '@mui/material';
import * as React from 'react';
import {
  Achievement, AchievementsType, achievementToColor, achievementToIcon, achievementToTitle,
} from '../../utils/achievements';

interface SingleAchievementProps {
  gameId: number | undefined;
  icon: IconProp;
  color: string;
  title: string;
  description: string;
}

function HiddenAchievement(): JSX.Element {
  return (
    <Card sx={{ margin: 0.5 }}>
      <CardContent sx={{ color: 'disabled' }}>
        <div>
          <FontAwesomeIcon icon={faCircleQuestion} size="3x" />
        </div>
        <Typography variant="caption" sx={{ fontSize: '60%' }}>
          Hidden
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '50%' }}>
          <em>
            Locked
          </em>
        </Typography>
      </CardContent>
    </Card>
  );
}

function SingleAchievement({
  gameId, icon, color, title, description,
}: SingleAchievementProps): JSX.Element {
  if (gameId === undefined) return <HiddenAchievement />;

  return (
    <Card sx={{ margin: 0.5 }}>
      <Tooltip title={description}>
        <CardContent sx={{ color }}>
          <div>
            <FontAwesomeIcon icon={icon} size="3x" />
          </div>
          <Typography variant="caption" sx={{ fontSize: '70%' }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '50%' }}>
            <em>
              Game #
              {gameId}
            </em>
          </Typography>
        </CardContent>
      </Tooltip>
    </Card>
  );
}

interface AchievementsProps {
  onClose: () => void;
  achievements: AchievementsType;
}

function Achievements({ onClose, achievements }: AchievementsProps): JSX.Element {
  return (
    <Dialog open onClose={onClose} sx={{ maxWidth: '90vw' }}>
      <DialogTitle>Achievements</DialogTitle>
      <DialogContent>
        <DialogContentText>
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
        </DialogContentText>
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
