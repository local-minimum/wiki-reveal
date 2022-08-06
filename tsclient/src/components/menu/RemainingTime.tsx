import { Alert } from '@mui/material';
import * as React from 'react';
import useLive from '../../hooks/useLive';
import { simpleDuration } from '../../utils/time';

interface RemainingTimeProps {
  end: Date;
}

function RemainingTime({ end }: RemainingTimeProps): JSX.Element {
  const [updateFreq, setUpdateFreq] = React.useState<number>(1000);
  const now = useLive(updateFreq);
  const remaining = end.getTime() - now;
  React.useEffect(() => {
    if (remaining < 120000 && updateFreq !== 1000) setUpdateFreq(1000);
    if (remaining > 120000 && updateFreq !== 60000) setUpdateFreq(60000);
  }, [remaining, updateFreq]);

  if (remaining < 60000) {
    return (
      <Alert severity="warning">
        Remaining time:
        {' '}
        {simpleDuration(end)}
      </Alert>
    );
  }

  return (
    <Alert severity="info">
      Remaining time:
      {' '}
      {simpleDuration(end)}
    </Alert>
  );
}

export default RemainingTime;
