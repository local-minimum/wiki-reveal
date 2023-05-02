import { faClose, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { LexicalizedToken } from '../../types/wiki';
import {
  Achievement, AchievementsType, achievementToTitle, updateAchievements,
} from '../../utils/achievements';
import { RevealedWord, WordBlock } from '../WikiParagraph';

interface RevealYesterdayProps {
  onClose: () => void;
  title: LexicalizedToken[] | undefined;
  page: string | undefined;
  gameId: number | undefined;
  achievements: AchievementsType;
  language: string | undefined;
  onSetAchievements: (achievements: AchievementsType) => void;
}

function RevealYesterday({
  onClose, title, gameId, achievements, onSetAchievements, page, language = 'en',
}: RevealYesterdayProps): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const [revealed, setRevealed] = React.useState<boolean[]>(
    (title ?? []).map(([, isHidden]) => !isHidden),
  );

  React.useEffect(() => {
  }, [achievements, gameId, onSetAchievements, revealed]);

  const handleReveal = (idx: number) => {
    const newRevealed = [
      ...revealed.slice(0, idx),
      true,
      ...revealed.slice(idx + 1),
    ];

    if (
      gameId !== undefined
      && newRevealed.length > 0
      && achievements[Achievement.CheckYesterdaysSolution] === undefined
      && newRevealed.every((v) => v)
    ) {
      onSetAchievements(
        updateAchievements(achievements, [Achievement.CheckYesterdaysSolution], gameId),
      );
      enqueueSnackbar(
        (
          <>
            <strong>Achievement:</strong>
            {' '}
            {achievementToTitle(Achievement.CheckYesterdaysSolution)[0]}
          </>
        ),
        { variant: 'success' },
      );
    }
    return setRevealed(newRevealed);
  };

  const allRevealed = revealed.every((v) => v)
    && revealed.length > 0
    && page !== undefined
    && page.length > 0;

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
                  <Typography variant="h4" sx={{ fontFamily: 'ui-monospace, monospace' }}>
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
                              <WordBlock word={word} numberHint />
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
                    {allRevealed && (
                    <Link
                      href={`https://${language}.wikipedia.org/wiki/${page}`}
                      sx={{ marginLeft: 1 }}
                    >
                      <FontAwesomeIcon icon={faLink} />
                    </Link>
                    )}
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
