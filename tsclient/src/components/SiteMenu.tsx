import {
  faBars, faBroom, faEye, faEyeLowVision, faGear, faInfo, faMedal,
  faPeopleGroup,
  faPersonChalkboard, faPlay, faStar, faTrophy, faUserSecret,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem,
} from '@mui/material';
import * as React from 'react';
import { GameMode } from '../api/page';
import { CoopGameType, ExpireType } from '../hooks/useCoop';
import { LexicalizedToken } from '../types/wiki';
import { AchievementsType } from '../utils/achievements';
import Achievements from './menu/Achievements';
import CoopMode from './menu/CoopMode';
import HowTo from './menu/HowTo';
import InfoDialog from './menu/InfoDialog';
import RemainingTime from './menu/RemainingTime';
import RevealYesterday from './menu/RevealYesterday';
import UserOptions, { UserSettings } from './menu/UserOptions';
import VictoryHistory from './menu/VictoryHistory';
import WipeDataDialog from './menu/WipeDataDialog';

interface SiteMenuProps {
  yesterdaysTitle: LexicalizedToken[] | undefined;
  yesterdaysPage: string | undefined;
  onShowVictory: (() => void) | undefined;
  achievements: AchievementsType;
  onSetAchievements: (achievements: AchievementsType) => void;
  gameId: number | undefined;
  hideFound: boolean;
  onHideFound: (hide: boolean) => void;
  end: Date | undefined;
  gameMode: GameMode;
  onChangeGameMode: (mode: GameMode) => void;
  username: string | null;
  onChangeUsername: (newName: string | null) => void;
  onCreateCoopGame: (gameType: CoopGameType, expireType: ExpireType, expire: number) => void;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  coopRoom: string | null;
  coopInRoom: boolean;
  coopUsers: string[];
  onJoinCoopGame: (room: string) => void;
  userSettings: UserSettings;
  onChangeUserSettings: (settings: UserSettings) => void;
  language: string | undefined;
}

function SiteMenu({
  yesterdaysTitle, onShowVictory, achievements, onSetAchievements, gameId, hideFound, onHideFound,
  end, gameMode, onChangeGameMode, username, onChangeUsername, onCreateCoopGame, connected,
  onConnect, onDisconnect, coopRoom, coopUsers, onJoinCoopGame, coopInRoom, userSettings,
  onChangeUserSettings, yesterdaysPage, language,
}: SiteMenuProps): JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const [showWipe, setShowWipe] = React.useState<boolean>(false);
  const [showAbout, setShowAbout] = React.useState<boolean>(false);
  const [showHowTo, setShowHowTo] = React.useState<boolean>(false);
  const [showGameHistory, setShowGameHistory] = React.useState<boolean>(false);
  const [showAchievements, setShowAchievements] = React.useState<boolean>(false);
  const [showYesterdays, setShowYesterdays] = React.useState<boolean>(false);
  const [showCoop, setShowCoop] = React.useState<boolean>(false);
  const [showSettings, setShowSettings] = React.useState<boolean>(false);

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
        {end !== undefined && (
          <>
            <RemainingTime end={end} yesterdays={gameMode === 'yesterday'} />
            <Divider />
          </>
        )}
        {onShowVictory !== undefined && (
          <MenuItem onClick={() => { handleClose(); onShowVictory(); }}>
            <ListItemIcon>
              <FontAwesomeIcon icon={faMedal} />
            </ListItemIcon>
            <ListItemText>
              Show current victory
            </ListItemText>
          </MenuItem>
        )}
        <MenuItem
          title="Useful for sharing progress, to brag or share in frustration."
          onClick={() => onHideFound(!hideFound)}
        >
          <ListItemIcon>
            <FontAwesomeIcon icon={hideFound ? faEye : faEyeLowVision} />
          </ListItemIcon>
          <ListItemText>
            {`${hideFound ? 'Show' : 'Hide'} Found Words`}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); setShowGameHistory(true); }}>
          <ListItemIcon>
            <FontAwesomeIcon icon={faTrophy} />
          </ListItemIcon>
          <ListItemText>
            Game history
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
        <MenuItem
          onClick={() => {
            handleClose();
            if (gameMode === 'today') {
              onChangeGameMode('yesterday');
            } else {
              onChangeGameMode('today');
            }
          }}
        >
          <ListItemIcon>
            <FontAwesomeIcon icon={faPlay} />
          </ListItemIcon>
          <ListItemText>
            Play
            {' '}
            {gameMode === 'today' ? 'yesterday' : 'today'}
            &apos;s game
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => { handleClose(); setShowCoop(true); }}
        >
          <ListItemIcon>
            <FontAwesomeIcon icon={faPeopleGroup} />
          </ListItemIcon>
          <ListItemText>
            Play COOP-game
          </ListItemText>
        </MenuItem>
        {gameMode === 'today' && (
          <MenuItem onClick={() => { handleClose(); setShowYesterdays(true); }}>
            <ListItemIcon>
              <FontAwesomeIcon icon={faUserSecret} />
            </ListItemIcon>
            <ListItemText>
              Yesterday&apos;s solution
            </ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={() => { handleClose(); setShowHowTo(true); }}>
          <ListItemIcon>
            <FontAwesomeIcon icon={faPersonChalkboard} />
          </ListItemIcon>
          <ListItemText>
            How to play
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); setShowAbout(true); }}>
          <ListItemIcon>
            <FontAwesomeIcon icon={faInfo} />
          </ListItemIcon>
          <ListItemText>
            About
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleClose(); setShowSettings(true); }}>
          <ListItemIcon>
            <FontAwesomeIcon icon={faGear} />
          </ListItemIcon>
          <ListItemText>
            Settings
          </ListItemText>
        </MenuItem>
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
      {showHowTo && <HowTo onClose={() => setShowHowTo(false)} />}
      {showGameHistory && <VictoryHistory onClose={() => setShowGameHistory(false)} />}
      {showAchievements && (
        <Achievements achievements={achievements} onClose={() => setShowAchievements(false)} />
      )}
      {showYesterdays && (
        <RevealYesterday
          onClose={() => setShowYesterdays(false)}
          title={yesterdaysTitle}
          page={yesterdaysPage}
          language={language}
          achievements={achievements}
          onSetAchievements={onSetAchievements}
          gameId={gameId}
        />
      )}
      {showCoop && (
        <CoopMode
          onClose={() => setShowCoop(false)}
          onChangeUsername={onChangeUsername}
          username={username}
          onCreateGame={onCreateCoopGame}
          connected={connected}
          gameMode={gameMode}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          users={coopUsers}
          room={coopRoom}
          inRoom={coopInRoom}
          onJoin={onJoinCoopGame}
          onQuitCoop={() => onChangeGameMode('today')}
        />
      )}
      {showSettings && (
        <UserOptions
          onClose={() => setShowSettings(false)}
          userSettings={userSettings}
          onChangeUserSettings={onChangeUserSettings}
        />
      )}
    </>
  );
}

export default SiteMenu;
