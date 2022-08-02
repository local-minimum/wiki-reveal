import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link, Typography,
} from '@mui/material';
import * as React from 'react';

function LoadFail(): JSX.Element {
  const [open, setOpen] = React.useState<boolean>(true);
  const onClose = () => setOpen(false);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Failed to load article</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography>
            Hopefully this is a transitory thing so check back in a little
            while and it ought to be up and runnig.
          </Typography>
          <Typography>
            However, should there be cause for concern consider reporting
            an issue on
            <Link href="">
              Github
            </Link>
            .
          </Typography>
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

export default LoadFail;
