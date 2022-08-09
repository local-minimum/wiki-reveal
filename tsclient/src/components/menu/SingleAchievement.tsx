import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCircleQuestion, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card, CardContent, IconButton, Tooltip, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import * as React from 'react';
import { Game } from '../../utils/achievements';

interface SingleAchievementProps {
  game: Game | undefined;
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
  game, icon, color, title, description,
}: SingleAchievementProps): JSX.Element {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [openTooltip, setOpenTooltip] = React.useState<boolean>(false);
  const handleOpenTooltip = React.useCallback(() => setOpenTooltip(true), []);
  const handleCloseTooltip = React.useCallback(() => setOpenTooltip(false), []);

  if (game === undefined) {
    return <HiddenAchievement />;
  }

  return (
    <Card sx={{ margin: 0.5 }}>
      <Tooltip
        title={description}
        open={openTooltip}
        onOpen={handleOpenTooltip}
        onClose={handleCloseTooltip}
      >
        <CardContent sx={{ color, backgroundColor: '#222' }}>
          {isSmall && (
            <IconButton
              onClick={handleOpenTooltip}
              size="small"
              sx={{ float: 'right', marginRight: -1, color }}
            >
              <FontAwesomeIcon icon={faInfoCircle} />
            </IconButton>
          )}
          <div>
            <FontAwesomeIcon icon={icon} size="3x" />
          </div>
          <Typography variant="caption" sx={{ fontSize: '70%' }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '50%' }}>
            <em>
              {typeof game === 'string' ? 'Coop Game ' : 'Game '}
              {String(game).slice(0, 6)}
            </em>
          </Typography>
        </CardContent>
      </Tooltip>
    </Card>
  );
}
