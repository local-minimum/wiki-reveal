import { pluralize } from './plural';

export function simpleDuration(end: Date): string {
  const seconds = Math.round((end.getTime() - (new Date()).getTime()) / 1000);
  if (seconds < 0) return 'None!';
  if (seconds < 60) return `${seconds} ${pluralize('second', seconds)}`;

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} ${pluralize('minute', minutes)}`;

  const hours = Math.round(minutes / 60);
  return `${hours} ${pluralize('hour', hours)}`;
}

export function deltaMinutes(
  from: Date | undefined,
  to: Date | undefined,
): number {
  if (from === undefined || to === undefined) return NaN;

  return (
    Math.floor(to.getTime() / 1000)
    - Math.floor(from.getTime() / 1000)
  ) / 60;
}
