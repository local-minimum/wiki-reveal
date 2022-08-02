import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card, CardContent, Tooltip, Typography,
} from '@mui/material';
import * as React from 'react';

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

export function SingleAchievement({
  gameId, icon, color, title, description,
}: SingleAchievementProps): JSX.Element {
  if (gameId === undefined) {
    return <HiddenAchievement />;
  }

  return (
    <Card sx={{ margin: 0.5 }}>
      <Tooltip title={description}>
        <CardContent sx={{ color, backgroundColor: '#222' }}>
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
