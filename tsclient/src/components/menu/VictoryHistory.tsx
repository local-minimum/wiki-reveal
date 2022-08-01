import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import * as React from 'react';

import useStoredValue from '../../hooks/useStoredValue';
import { VictoryType } from '../VictoryType';

interface VictoryHistoryProps {
  onClose: () => void;
}

function VictoryHistory({ onClose }: VictoryHistoryProps): JSX.Element {
  const [playerResults] = useStoredValue<Array<[number, VictoryType]>>('player-results', []);

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Victories</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Summary of all your victories to date.
          {
            playerResults.length === 0
              ? ' However, you need to win at least one you can look at the results'
              : ''
          }
        </DialogContentText>
        {playerResults.length > 0 && (
          <TableContainer sx={{ maxHeight: '50vw', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Game #
                  </TableCell>
                  <TableCell>
                    Title
                  </TableCell>
                  <TableCell>
                    Guesses ( Hints )
                  </TableCell>
                  <TableCell>
                    Accuracy [%]
                  </TableCell>
                  <TableCell>
                    Revealed [%]
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {playerResults.map(([gameId, {
                  pageName, guesses, hints, accuracy, revealed,
                }]) => (
                  <TableRow key={gameId}>
                    <TableCell>{gameId}</TableCell>
                    <TableCell>{pageName.replace('_', ' ')}</TableCell>
                    <TableCell>{`${guesses} (${hints})`}</TableCell>
                    <TableCell>{accuracy.toFixed(1)}</TableCell>
                    <TableCell>{revealed.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
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

export default VictoryHistory;
