import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Typography,
} from '@mui/material';
import * as React from 'react';
import { NewsItem } from '../hooks/useNews';

interface NewsProps {
  onClose: () => void;
  news: NewsItem[];
}

function News({ onClose, news }: NewsProps): JSX.Element {
  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>News</DialogTitle>
      <DialogContent>
        {news.map(({ id, title, content }) => (
          <Card key={id}>
            <CardContent>
              <Typography variant="h6" gutterBottom>{title}</Typography>
              {content}
            </CardContent>
          </Card>
        ))}
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

export default News;
