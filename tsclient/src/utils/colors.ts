import { GameMode } from '../api/page';

export function wikiPageBGColor(gameMode: GameMode): string {
  if (gameMode === 'coop') return '#ced4ef';
  if (gameMode === 'yesterday') return '#ceefea';
  return '#efd9ce';
}
