import {
  faBars, faBroom, faInfo, faPersonDigging,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem,
} from '@mui/material';
import * as React from 'react';
import InfoDialog from './menu/InfoDialog';
import WipeDataDialog from './menu/WipeDataDialog';

function SiteMenu(): JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const [showWipe, setShowWipe] = React.useState<boolean>(false);
  const [showAbout, setShowAbout] = React.useState<boolean>(false);

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
        <MenuItem>
          <ListItemIcon>
            <FontAwesomeIcon icon={faPersonDigging} />
          </ListItemIcon>
          <ListItemText>
            Game History
          </ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <FontAwesomeIcon icon={faPersonDigging} />
          </ListItemIcon>
          <ListItemText>
            Achievments
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setShowAbout(true)}>
          <ListItemIcon>
            <FontAwesomeIcon icon={faInfo} />
          </ListItemIcon>
          <ListItemText>
            About
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setShowWipe(true)}>
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
    </>
  );
}

export default SiteMenu;
