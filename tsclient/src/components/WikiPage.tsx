import {
  Alert, Box, LinearProgress, Stack, SxProps, Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

import { getPage } from '../api/page';
import WikiParagraph from './WikiParagraph';
import WikiSection from './WikiSection';

/* Palette
#25283D
#8F3985
#A675A1
#CEA2AC
#EFD9CE
*/

function WikiPage(): JSX.Element {
  const { isLoading, isError, data } = useQuery(
    ['page'],
    getPage,
  );
  const { title, summary, sections } = data?.page ?? { summary: [], sections: [] };
  console.log(data?.lexicon);
  const commonSX: Partial<SxProps> = {
    backgroundColor: '#EFD9CE',
    color: '#25283D',
    paddingLeft: 2,
    paddingRight: 2,
  };

  return (
    <Box
      sx={{
        w: '100%',
        h: '100%',
      }}
    >
      {isError && <Alert severity="error">Could not load the article, perhaps try again later or wait for tomorrow</Alert>}
      {isLoading && <LinearProgress />}
      <Stack direction="row">
        <Box sx={{ w: '70%', p: 1 }}>
          <Typography variant="h1" sx={{ fontSize: '3rem', ...commonSX }}>
            {title && <WikiParagraph text={title} />}
          </Typography>
          {
            summary.map((paragraph, idx) => (
              <Typography
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
                variant="body1"
                sx={{ fontSize: '1.1rem', ...commonSX, marginTop: 1 }}
              >
                <WikiParagraph text={paragraph} />
              </Typography>
            ))
          }
          {
            // eslint-disable-next-line react/no-array-index-key
            sections.map((section, idx) => <WikiSection section={section} key={idx} />)
          }
        </Box>
      </Stack>
    </Box>
  );
}

export default WikiPage;
