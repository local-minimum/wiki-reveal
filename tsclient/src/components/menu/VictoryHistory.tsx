import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  SxProps,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useMediaQuery, useTheme,
} from '@mui/material';
import * as React from 'react';

import useStoredValue from '../../hooks/useStoredValue';
import { VictoryType } from '../VictoryType';

interface VictoryHistoryProps {
  onClose: () => void;
}

function VictoryHistory({ onClose }: VictoryHistoryProps): JSX.Element {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [playerResults] = useStoredValue<Array<[number, VictoryType]>>('player-results', []);

  const xsTableSx: SxProps | undefined = isSmall ? { fontSize: '70%' } : undefined;

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
          <TableContainer sx={{ maxHeight: '50vw' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={xsTableSx}
                    title="The game id"
                  >
                    {isSmall ? '#' : 'Game Id'}
                  </TableCell>
                  <TableCell
                    sx={xsTableSx}
                    title="The article title"
                  >
                    Title
                  </TableCell>
                  <TableCell
                    sx={xsTableSx}
                    title="The number of guesses and hints used"
                  >
                    {isSmall ? 'G(H)' : 'Guesses (Hints)'}
                  </TableCell>
                  <TableCell
                    sx={xsTableSx}
                    title="How many percent of your guesses existed in the article"
                  >
                    {`Acc${isSmall ? '.' : 'uracy [%]'}`}
                  </TableCell>
                  <TableCell
                    sx={xsTableSx}
                    title="How many percent of the article that was revealed (When title was solved)."
                  >
                    {`Rev${isSmall ? '.' : 'ealed [%]'}`}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {playerResults.map(([gameId, {
                  pageName, guesses, hints, accuracy, revealed,
                }]) => (
                  <TableRow key={gameId}>
                    <TableCell sx={xsTableSx}>{gameId}</TableCell>
                    <TableCell sx={xsTableSx}>{pageName.replace('_', ' ')}</TableCell>
                    <TableCell sx={xsTableSx}>{`${guesses} (${hints})`}</TableCell>
                    <TableCell sx={xsTableSx}>{accuracy.toFixed(1)}</TableCell>
                    <TableCell sx={xsTableSx}>{revealed.toFixed(1)}</TableCell>
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
