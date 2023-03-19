import { Box, SxProps, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface PlayClockProps {
  startISO: string | undefined | null;
  playDuration?: number;
  positioning?: SxProps;
}

export function humanFormatDuration(totalSeconds: number): string {
  const seconds = totalSeconds % 60;
  const minutes = (totalSeconds - seconds) / 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function PlayClock({
  startISO,
  playDuration,
  positioning = {
    position: 'fixed',
    top: 14,
    right: 46,
  },
}: PlayClockProps): JSX.Element {
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    if (playDuration != null) {
      setDuration(playDuration);
      return () => {};
    }

    const makeDuration = () => setDuration(
      startISO == null ? 0 : Math.floor((Date.now() - new Date(startISO).getTime()) / 1000),
    );

    const interval = setInterval(makeDuration, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [playDuration, startISO]);

  return (
    <Box sx={positioning}>
      <Typography
        sx={{
          padding: 0.5,
          paddingBottom: 0,
          color: '#25283D',
          backgroundColor: '#CEA2AC',
          borderColor: '#25283D',
          borderWidth: 1,
          borderStyle: 'absolute',
        }}
      >
        {humanFormatDuration(duration)}
      </Typography>
    </Box>
  );
}

export default PlayClock;
