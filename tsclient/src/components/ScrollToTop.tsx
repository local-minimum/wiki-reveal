import { faCircleChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Fade, useScrollTrigger } from '@mui/material';
import * as React from 'react';

interface ScrollToTopProps {
  topId: string;
  target?: Node;
  visibilityThreshold?: number;
  margin?: number;
  size?: 1 | 2 | 3;
  yOffset?: string;
}

function ScrollToTop({
  target, visibilityThreshold = 100, topId, margin = 16, size = 3,
  yOffset,
}: ScrollToTopProps): JSX.Element {
  const trigger = useScrollTrigger({
    target,
    disableHysteresis: true,
    threshold: visibilityThreshold,
  });

  const handleClick = React.useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
    const anchor = ((evt.target as HTMLDivElement).ownerDocument || document)
      .querySelector(`#${topId}`);

    if (anchor != null) {
      anchor.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [topId]);

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{
          position: 'sticky',
          bottom: yOffset === undefined ? margin : `calc(${yOffset} + ${margin}px)`,
          float: 'right',
          marginRight: `${margin}px`,
          zIndex: 100,
          cursor: 'pointer',
        }}
      >
        <FontAwesomeIcon size={`${size}x`} icon={faCircleChevronUp} />
      </Box>
    </Fade>
  );
}

export default ScrollToTop;
