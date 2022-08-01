import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCircleQuestion, faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Tooltip, Typography,
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
    <Card>
      <CardContent sx={{ color: 'disabled' }}>
        <FontAwesomeIcon icon={faCircleQuestion} />
        <Typography variant="caption">
          Hidden achievement
        </Typography>
        <Typography variant="body2"><em>Locked</em></Typography>
      </CardContent>
    </Card>
  );
}

function SingleAchievement({
  gameId, icon, color, title, description,
}: SingleAchievementProps): JSX.Element {
  if (gameId === undefined) return <HiddenAchievement />;

  return (
    <Card>
      <Tooltip title={description}>
        <CardContent sx={{ color }}>
          <FontAwesomeIcon icon={icon} />
          <Typography variant="caption">
            {title}
          </Typography>
          <Typography variant="body2">
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
    <Dialog open onClose={onClose}>
      <DialogTitle>Achievements</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {Object
            .keys(Achievement)
            .sort((a, b) => (a < b ? -1 : 1))
            .map((a) => {
              const achievement = a as Achievement;
              const [title, description] = achievementToTitle(achievement);
              return (
                <SingleAchievement
                  key={a}
                  gameId={achievements[achievement]}
                  icon={achievementToIcon(achievement)}
                  title={title}
                  description={description}
                  color={achievementToColor(achievement)}
                />
              );
            })}
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
