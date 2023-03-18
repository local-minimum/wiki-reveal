import {
  Box,
  Button,
  Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs, useMediaQuery, useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import GuessCloud from './GuessCloud';
import { Guess } from './Guess';
import GuessHistogram from './GuessHistogram';
import GuessTable from './GuessTable';
import { UserSettings } from './menu/UserOptions';
import { GameMode } from '../api/page';

interface GameStatsProps {
  guesses: Array<Guess>;
  lexicon: Record<string, number>;
  titleLexes: string[];
  headingLexes: string[];
  rankings: Record<string, number>;
  userSettings: UserSettings;
  gameMode: GameMode;
  onClose: () => void;
}

enum GameStatTab {
  WordCloud = 'word-cloud',
  Histogram = 'histogram',
  GuessHistory = 'guess-history',
}

interface TabPanelProps {
  children?: React.ReactNode;
  selected: GameStatTab;
  value: GameStatTab;
}

const noop = () => { /** NOOP */ };

function TabPanel({
  children, selected, value,
}: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== selected}
      id={`simple-tabpanel-${value}`}
      aria-labelledby={`simple-tab-${value}`}
    >
      {value === selected && children}
    </div>
  );
}

function GameStats({
  onClose,
  guesses,
  lexicon,
  titleLexes,
  headingLexes,
  rankings,
  userSettings,
  gameMode,
}: GameStatsProps): JSX.Element {
  const theme = useTheme();
  const isSmallish = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setTab] = useState(GameStatTab.WordCloud);

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth={isSmallish}
      sx={{ minWidth: '50vw', minHeight: '50vh' }}
    >
      <DialogTitle>Game Stats</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setTab(value)}
            aria-label="game stats tabs"
          >
            <Tab label="Word Cloud" value={GameStatTab.WordCloud} />
            <Tab label="Histogram" value={GameStatTab.Histogram} />
            <Tab label="Guess History" value={GameStatTab.GuessHistory} />
          </Tabs>
        </Box>
        <TabPanel value={GameStatTab.WordCloud} selected={activeTab}>
          <GuessCloud
            guesses={guesses}
            lexicon={lexicon}
            titleLexes={titleLexes}
            headingLexes={headingLexes}
            fullScreen
          />
        </TabPanel>
        <TabPanel value={GameStatTab.Histogram} selected={activeTab}>
          <GuessHistogram guesses={guesses} lexicon={lexicon} />
        </TabPanel>
        <TabPanel value={GameStatTab.GuessHistory} selected={activeTab}>
          <GuessTable
            guesses={guesses}
            lexicon={lexicon}
            titleLexes={titleLexes}
            headingLexes={headingLexes}
            focusWord={null}
            freeWords={undefined}
            rankings={rankings}
            onSetFocusWord={noop}
            unmasked={false}
            userSettings={userSettings}
            gameMode={gameMode}
          />
        </TabPanel>
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

export default GameStats;
