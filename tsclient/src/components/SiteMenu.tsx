import {
  faBars, faBroom, faInfo, faMedal, faStar, faTrophy, faUserSecret,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem,
} from '@mui/material';
import * as React from 'react';
import { LexicalizedToken } from '../types/wiki';
import { AchievementsType } from '../utils/achievements';
import Achievements from './menu/Achievements';
import InfoDialog from './menu/InfoDialog';
import RevealYesterday from './menu/RevealYesterday';
import VictoryHistory from './menu/VictoryHistory';
import WipeDataDialog from './menu/WipeDataDialog';

interface SiteMenuProps {
  yesterdaysTitle: LexicalizedToken[] | undefined;
  onShowVictory: (() => void) | undefined;
  achievements: AchievementsType;
  onSetAchievements: (achievements: AchievementsType) => void;
  gameId: number | undefined;
}

function SiteMenu({
  yesterdaysTitle, onShowVictory, achievements, onSetAchievements, gameId,
}: SiteMenuProps): JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const [showWipe, setShowWipe] = React.useState<boolean>(false);
  const [showAbout, setShowAbout] = React.useState<boolean>(false);
  const [showGameHistory, setShowGameHistory] = React.useState<boolean>(false);
  const [showAchievements, setShowAchievements] = React.useState<boolean>(false);
  const [showYesterdays, setShowYesterdays] = React.useState<boolean>(false);

  return (
    <>
      <IconButton
        sx={{
          position: 'fixed', top: 8, right: 8, zIndex: 200,
        }}
        onClick={handleButtonClick}
        title="Menu"
      >
        <FontAwesomeIcon icon={faBars} size="1x" />
      </IconButton>
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        {onShowVictory !== undefined && (
          <MenuItem onClick={() => { handleClose(); onShowVictory(); }}>
            <ListItemIcon>
              <FontAwesomeIcon icon={faMedal} />
            </ListItemIcon>
            <ListItemText>
              Show Current Victory
            </ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => { handleClose(); setShowGameHistory(true); }}>
          <ListItemIcon>
            <FontAwesomeIcon icon={faTrophy} />
          </ListItemIcon>
          <ListItemText>
            Game History
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); setShowAchievements(true); }}>
          <ListItemIcon>
            <FontAwesomeIcon icon={faStar} />
          </ListItemIcon>
          <ListItemText>
            Achievements
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); setShowYesterdays(true); }}>
          <ListItemIcon>
            <FontAwesomeIcon icon={faUserSecret} />
          </ListItemIcon>
          <ListItemText>
            Yesterday&apos;s Solution
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleClose(); setShowAbout(true); }}>
          <ListItemIcon>
            <FontAwesomeIcon icon={faInfo} />
          </ListItemIcon>
          <ListItemText>
            About
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleClose(); setShowWipe(true); }}>
          <ListItemIcon>
            <FontAwesomeIcon icon={faBroom} />
          </ListItemIcon>
          <ListItemText>
            Wipe stored data
          </ListItemText>
        </MenuItem>
      </Menu>
      {showWipe && <WipeDataDialog onClose={() => setShowWipe(false)} />}
      {showAbout && <InfoDialog onClose={() => setShowAbout(false)} />}
      {showGameHistory && <VictoryHistory onClose={() => setShowGameHistory(false)} />}
      {showAchievements && (
        <Achievements achievements={achievements} onClose={() => setShowAchievements(false)} />
      )}
      {showYesterdays && (
        <RevealYesterday
          onClose={() => setShowYesterdays(false)}
          title={yesterdaysTitle}
          achievements={achievements}
          onSetAchievements={onSetAchievements}
          gameId={gameId}
        />
      )}
    </>
  );
}

export default SiteMenu;