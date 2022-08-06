import { Alert } from '@mui/material';
import * as React from 'react';
import useLive from '../../hooks/useLive';
import { simpleDuration } from '../../utils/time';

interface RemainingTimeProps {
  end: Date;
  yesterdays: boolean
}

const DAY = 1000 * 60 * 60 * 24;

function RemainingTime({ end, yesterdays }: RemainingTimeProps): JSX.Element {
  const [updateFreq, setUpdateFreq] = React.useState<number>(1000);
  const now = useLive(updateFreq);
  const remaining = end.getTime() - now + (yesterdays ? DAY : 0);

  React.useEffect(() => {
    if (remaining < 120000 && updateFreq !== 1000) setUpdateFreq(1000);
    if (remaining > 120000 && updateFreq !== 60000) setUpdateFreq(60000);
  }, [remaining, updateFreq]);

  const durationText = simpleDuration(new Date(end.getTime() + (yesterdays ? DAY : 0)));

  return (
    <Alert severity={remaining < 60000 ? 'warning' : 'info'}>
      Remaining time:
      {' '}
      {durationText}
    </Alert>
  );
}

export default RemainingTime;
