import { faArrowDownWideShort, faArrowUpShortWide } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';

interface SortIconProps {
  filter: string;
  sortType: string;
  sortVariant: 'asc' | 'desc';
}

function SortIcon({ filter, sortType, sortVariant }: SortIconProps): JSX.Element | null {
  if (filter !== sortType) return null;
  return (sortVariant === 'asc'
    ? <FontAwesomeIcon icon={faArrowUpShortWide} />
    : <FontAwesomeIcon icon={faArrowDownWideShort} />
  );
}

export default SortIcon;
