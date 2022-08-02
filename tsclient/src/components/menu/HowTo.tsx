import * as React from 'react';
import {
  Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  List, ListItem, ListItemIcon, ListItemText, Typography,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faHeading, faPuzzlePiece, faStar } from '@fortawesome/free-solid-svg-icons';

interface HowToProps {
  onClose: () => void;
}

function HowTo({ onClose }: HowToProps): JSX.Element {
  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>How To Play</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography gutterBottom>
            Each day there&apos;s a new wikipedia article selected.
            You guess the words in it and if your guess exists that word
            is revealed.
            When you&apos;ve revealed the entire title you&apos;ve won.
          </Typography>
          <Typography gutterBottom>
            There are some feature that does not exist on the original Redactle:
            <List>
              <ListItem>
                You can get hints.
              </ListItem>
              <ListItem>
                The guess list can be sorted as you please by clicking column headers.
              </ListItem>
              <ListItem>
                You may continue playing after revealing the title.
              </ListItem>
              <ListItem>
                You must reveal the entire title, including parenthesis.
              </ListItem>
              <ListItem>
                There are achievements.
              </ListItem>
            </List>
          </Typography>
        </DialogContentText>
        <List>
          <ListItem>
            <ListItemIcon>
              <FontAwesomeIcon icon={faStar} />
            </ListItemIcon>
            <ListItemText>
              This represents
              {' '}
              <strong>title</strong>
              {' '}
              words.
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FontAwesomeIcon icon={faHeading} />
            </ListItemIcon>
            <ListItemText>
              This represents
              {' '}
              <strong>heading</strong>
              {' '}
              words (not title).
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FontAwesomeIcon icon={faPuzzlePiece} />
            </ListItemIcon>
            <ListItemText>
              This represents
              {' '}
              <strong>hints</strong>
              .
            </ListItemText>
          </ListItem>
        </List>
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

export default HowTo;
