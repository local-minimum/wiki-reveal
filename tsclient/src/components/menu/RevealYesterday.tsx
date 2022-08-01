import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography,
} from '@mui/material';
import * as React from 'react';
import { LexicalizedToken } from '../../types/wiki';
import { Achievement, AchievementsType, updateAchievements } from '../../utils/achievements';
import { RevealedWord, WordBlock } from '../WikiParagraph';

interface RevealYesterdayProps {
  onClose: () => void;
  title: LexicalizedToken[] | undefined;
  gameId: number | undefined;
  achievements: AchievementsType;
  onSetAchievements: (achievements: AchievementsType) => void;
}

function RevealYesterday({
  onClose, title, gameId, achievements, onSetAchievements,
}: RevealYesterdayProps): JSX.Element {
  const [revealed, setRevealed] = React.useState<boolean[]>(
    (title ?? []).map(() => false),
  );

  React.useEffect(() => {
    if (
      gameId !== undefined
      && revealed.length > 0
      && achievements[Achievement.CheckYesterdaysSolution] === undefined
      && revealed.every((v) => v)
    ) {
      onSetAchievements(
        updateAchievements(achievements, [Achievement.CheckYesterdaysSolution], gameId),
      );
    }
  }, [achievements, gameId, onSetAchievements, revealed]);

  const handleReveal = (idx: number) => setRevealed([
    ...revealed.slice(0, idx),
    true,
    ...revealed.slice(idx + 1),
  ]);

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>
        Yesterday&apos;s game
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            title === undefined
              ? 'There was no game yesterday. Probably this is the first game ever!'
              : (
                <>
                  <Typography>
                    Yesterday&apos;s article title was:
                  </Typography>
                  <Typography variant="h4">
                    {
                      title.map(([word, isHidden], idx) => {
                        if (isHidden && !revealed[idx]) {
                          return (
                            <Box
                              // eslint-disable-next-line react/no-array-index-key
                              key={idx}
                              component="span"
                              sx={{ cursor: 'pointer' }}
                              onClick={() => handleReveal(idx)}
                            >
                              <WordBlock word={word} />
                            </Box>
                          );
                        }
                        return (
                          <RevealedWord
                            // eslint-disable-next-line react/no-array-index-key
                            key={idx}
                            word={word}
                            focused={false}
                            scrollTo={false}
                          />
                        );
                      })
                    }
                  </Typography>
                  <Typography variant="caption">
                    Click on blocked out word(s) to reveal them.
                  </Typography>
                </>
              )
          }
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

export default RevealYesterday;
