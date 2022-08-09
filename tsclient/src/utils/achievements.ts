import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faAlignJustify,
  faAward,
  faBed,
  faBrain, faCalendarCheck, faCalendarDays, faCat, faCow,
  faCrow, faCrown, faDna, faDraftingCompass, faEye,
  faFaceRollingEyes, faGlobe, faGrinWink, faHandsHoldingChild, faMagnifyingGlass, faMedal,
  faPeopleCarryBox,
  faPeopleGroup,
  faPeoplePulling,
  faPerson, faPersonDigging, faPersonDrowning, faPersonPraying, faRankingStar,
  faShuttleSpace, faTrophy, faUserGraduate, faUsersBetweenLines,
} from '@fortawesome/free-solid-svg-icons';
import { GameMode } from '../api/page';
import { Guess } from '../components/Guess';
import { VictoryType } from '../components/VictoryType';
import { relIndexed } from './array';
import {
  avg, larger, smaller, within,
} from './math';
import { isDefined } from './typeGates';

export enum Achievement {
  FirstWin = 'first-win',
  GuessOnlyTitle = 'guesses-tiltle-only',
  GuessOnlyHeaders = 'guesses-headers-only',
  GuessSingleDigit = 'guesses-less-than-10',
  GuessLessThan20 = 'guesses-less-than-20',
  Guess42 = 'guesses-equal-42',
  GuessLessThan50 = 'guesses-less-than-50',
  GuessLessThan100 = 'guesses-less-than-100',
  GuessMoreThan500 = 'guesses-more-than-500',
  GuessMoreThan1000 = 'guesses-more-than-1000',
  HintNone = 'hints-max-0',
  HintMax3 = 'hints-max-3',
  HintMax10 = 'hints-max-10',
  HintMin100 = 'hints-min-100',
  Accurate100 = 'accuracy-100',
  Accurate90 = 'accuracy-more-than-90',
  Accurate50 = 'accuracy-more-than-50',
  AccurateLessThan10 = 'accuracy-les-than-10',
  ContinueGuessing = 'continue-guessing', // After solving it
  SpeedOneMinute = 'speed-less-than-1-min',
  SpeedTenMinutes = 'speed-less-than-10-min',
  SpeedOneHour = 'speed-less-than-1-hour',
  ThinkOnIt = 'think-on-it', // 18+ hours from start to done
  EarlyTenMinutes = 'early-first-10-min',
  EarlyOneHour = 'early-first-1-hour',
  LateFiveMinutes = 'late-last-5-minutes',
  LateLastMinute = 'late-last-1-minute',
  LateOverdue = 'late-overdue', // Play out today but solve it after time's up
  LateYesterdays = 'late-yesterdays', // Play out yesterdays game
  // About more than one game
  Streak3 = 'streak-win-3',
  Streak10 = 'streak-win-10',
  Streak30 = 'streak-win-30',
  StreakPerfect3 = 'streak-win-3-accurate', // 100% accuracy
  StreakWise5 = 'streak-win-5-few-guesses', // <20 guesses
  // These do not requiere winning
  Reveal40 = 'reveal-40',
  Reveal50 = 'reveal-50',
  Reveal60 = 'reveal-60',
  Reveal70 = 'reveal-70',
  Reveal80 = 'reveal-80',
  Reveal90 = 'reveal-90',
  Reveal100 = 'reveal-100',
  RevealAllHeaders = 'reveal-headers',
  RevealSummary90 = 'reveal-summary-90',
  RankTop10 = 'find-top-guesses-10', // All guesses found rank 1-10
  RankTop20 = 'find-top-guesses-20',
  RankTop50 = 'find-top-guesses-50',
  RankTop100 = 'find-top-guesses-100',
  // Meta
  Achieve50 = 'achievements-50', // Percent
  Achieve100 = 'achievements-100',
  CheckYesterdaysSolution = 'check-yesterdays',
  // Coop
  CoopWin = 'coop-win',
  CoopSolo = 'coop-solo',
  CoopGuessEqual = 'coop-guess-equal',
  CoopGuessFew = 'coop-guess-few',
  CoopGuessMany = 'coop-guess-many',
  CoopAccuracyLow = 'coop-accuracy-low',
  CoopAccuracyHigh = 'coop-accuracy-high',
  CoopTitleShare = 'coop-title-share',
  CoopTitleLast = 'coop-title-last',
  CoopTitleSolo = 'coop-title-solo'
}

export type GameId = number;
export type RoomId = string;
export type Game = RoomId | GameId;
export type AchievementsType = Partial<Record<Achievement, Game>>

export function achievementToIcon(achievement: Achievement): IconProp {
  if ([
    Achievement.RankTop10,
    Achievement.RankTop20,
    Achievement.RankTop50,
    Achievement.RankTop100,
  ].includes(achievement)) return faBrain;

  if ([
    Achievement.Achieve100,
    Achievement.Accurate50,
  ].includes(achievement)) return faGlobe;

  if ([
    Achievement.GuessMoreThan500,
    Achievement.GuessMoreThan1000,
  ].includes(achievement)) return faPersonPraying;

  if (achievement === Achievement.LateYesterdays) return faCalendarDays;
  if (achievement === Achievement.CheckYesterdaysSolution) return faCalendarCheck;

  if ([
    Achievement.Reveal40,
    Achievement.Reveal50,
    Achievement.Reveal60,
    Achievement.Reveal70,
    Achievement.Reveal80,
    Achievement.Reveal90,
    Achievement.Reveal100,
  ].includes(achievement)) return faEye;

  if (achievement === Achievement.RevealAllHeaders) return faDraftingCompass;
  if (achievement === Achievement.RevealSummary90) return faAlignJustify;

  if (achievement === Achievement.HintMin100) return faFaceRollingEyes;
  if ([
    Achievement.HintMax3,
    Achievement.HintMax10,
  ].includes(achievement)) return faHandsHoldingChild;

  if (achievement === Achievement.HintNone) return faPerson;

  if ([
    Achievement.Accurate100,
    Achievement.Accurate90,
    Achievement.Accurate50,
  ].includes(achievement)) return faUserGraduate;

  if (achievement === Achievement.AccurateLessThan10) return faMagnifyingGlass;
  if (achievement === Achievement.FirstWin) return faMedal;

  if ([
    Achievement.GuessLessThan100,
    Achievement.GuessLessThan50,
    Achievement.GuessLessThan20,
    Achievement.GuessSingleDigit,
    Achievement.GuessOnlyHeaders,
    Achievement.GuessOnlyTitle,
  ].includes(achievement)) return faTrophy;

  if (achievement === Achievement.Guess42) return faDna;

  if ([
    Achievement.Streak3,
    Achievement.Streak10,
    Achievement.Streak30,
    Achievement.StreakPerfect3,
    Achievement.StreakWise5,
  ].includes(achievement)) return faCrown;

  if ([
    Achievement.EarlyTenMinutes,
    Achievement.EarlyOneHour,
  ].includes(achievement)) return faCrow;

  if ([
    Achievement.LateFiveMinutes,
    Achievement.LateLastMinute,
    Achievement.LateOverdue,
  ].includes(achievement)) return faCow;

  if ([
    Achievement.SpeedOneMinute,
    Achievement.SpeedTenMinutes,
    Achievement.SpeedOneHour,
  ].includes(achievement)) return faCat;

  if (achievement === Achievement.CoopSolo) return faPersonDrowning;
  if (achievement === Achievement.CoopTitleShare) return faPeopleCarryBox;
  if (achievement === Achievement.CoopGuessMany) return faPeoplePulling;
  if (achievement === Achievement.CoopGuessEqual) return faUsersBetweenLines;
  if (achievement === Achievement.CoopAccuracyLow) return faPersonDigging;
  if (achievement === Achievement.CoopGuessFew) return faBed;
  if (achievement === Achievement.CoopAccuracyHigh) return faShuttleSpace;
  if (achievement === Achievement.CoopTitleSolo) return faGrinWink;
  if (achievement === Achievement.CoopTitleLast) return faRankingStar;
  if (achievement === Achievement.CoopWin) return faPeopleGroup;

  return faAward;
}

const SILVER: Achievement[] = [
  Achievement.Accurate100,
  Achievement.Streak10,
  Achievement.RankTop10,
  Achievement.RankTop20,
  Achievement.Reveal60,
  Achievement.Reveal70,
  Achievement.EarlyTenMinutes,
  Achievement.LateLastMinute,
  Achievement.SpeedTenMinutes,
  Achievement.GuessMoreThan1000,
  Achievement.GuessSingleDigit,
  Achievement.GuessLessThan20,
  Achievement.Guess42,
  Achievement.RevealAllHeaders,
  Achievement.RevealSummary90,
  Achievement.CoopGuessFew,
  Achievement.CoopGuessMany,
  Achievement.CoopTitleSolo,
];

const GOLD: Achievement[] = [
  Achievement.GuessOnlyTitle,
  Achievement.GuessOnlyHeaders,
  Achievement.SpeedOneMinute,
  Achievement.Streak30,
  Achievement.StreakPerfect3,
  Achievement.StreakWise5,
  Achievement.Achieve50,
  Achievement.Achieve100,
  Achievement.Reveal80,
  Achievement.Reveal90,
  Achievement.Reveal100,
  Achievement.RankTop50,
  Achievement.RankTop100,
  Achievement.CoopAccuracyHigh,
  Achievement.CoopAccuracyLow,
];

export function achievementToColor(achievement: Achievement): string {
  if (GOLD.includes(achievement)) return '#C9B037';
  if (SILVER.includes(achievement)) return '#B4B4B4';
  return '#AD8A56'; // '#6A3805';
}

export function achievementToTitle(achievement: Achievement): [string, string] {
  switch (achievement) {
    case Achievement.Accurate100:
      return ['Perfect', 'Game with 100% accuracy'];
    case Achievement.Accurate90:
      return ['Splendid', 'Game with above 90% accuracy'];
    case Achievement.Accurate50:
      return ['On it', 'Game with above 50% accuracy'];
    case Achievement.AccurateLessThan10:
      return ['Wrods?', 'Game with less than 10% accuracy'];
    case Achievement.FirstWin:
      return ['First Win', 'Win a game'];
    case Achievement.GuessOnlyTitle:
      return ['Too Easy', 'Only guess words from the title'];
    case Achievement.GuessOnlyHeaders:
      return ['At a Glancing', 'Only guess words from headers'];
    case Achievement.GuessSingleDigit:
      return ['Single Digit', 'Game with less than 10 guesses'];
    case Achievement.GuessLessThan20:
      return ['Great Game', 'Game with less than 20 guesses'];
    case Achievement.Guess42:
      return ['6 * 7', 'Game with exactly 42 guesses'];
    case Achievement.GuessLessThan50:
      return ['Decent Game', 'Game with less than 50 guesses'];
    case Achievement.GuessLessThan100:
      return ['Good Game', 'Game with less than 100 guesses'];
    case Achievement.GuessMoreThan500:
      return ['Sisyphus', 'Game with more than 500 guesses'];
    case Achievement.GuessMoreThan1000:
      return ['Don Quijote', 'Game with more than 1000 guesses'];
    case Achievement.HintNone:
      return ['On My Own', 'Game without hints'];
    case Achievement.HintMax3:
      return ['Support Wheels', 'Game with max 3 hints'];
    case Achievement.HintMax10:
      return ['Crutches', 'Game with max 10 hints'];
    case Achievement.HintMin100:
      return ['Clueless', 'Game with at least 100 hints'];
    case Achievement.ContinueGuessing:
      return ['Need More', 'Continue guessing words after finding the solution'];
    case Achievement.SpeedOneMinute:
      return ['Cheeta', 'Solve game in less than a minute'];
    case Achievement.SpeedTenMinutes:
      return ['Horse', 'Solve game in less than 10 minutes'];
    case Achievement.SpeedOneHour:
      return ['Human', 'Solve game in less than one hour'];
    case Achievement.ThinkOnIt:
      return ['Pensative', 'Solve the game at least 18 hours after starting it'];
    case Achievement.EarlyTenMinutes:
      return ['Early Bird', 'Solve the game within 10 minutes of becoming available'];
    case Achievement.EarlyOneHour:
      return ['Earlyish Bird', 'Solve the game within one hour of becoming avialable'];
    case Achievement.LateFiveMinutes:
      return ['Better Late', 'Solve the game within the last five minutes'];
    case Achievement.LateLastMinute:
      return ['Procratination', 'Solve the game within the last minute'];
    case Achievement.LateOverdue:
      return ['Tardy', 'Solve the game too late, while still being the current game'];
    case Achievement.LateYesterdays:
      return ['Going Back', 'Solve yesterday\'s game'];
    case Achievement.Streak3:
      return ['Streak!', 'Solve 3 in a row'];
    case Achievement.Streak10:
      return ['Streakier!!', 'Solve 10 in a row'];
    case Achievement.Streak30:
      return ['Streakceiption', 'Solve 30 in a row'];
    case Achievement.StreakPerfect3:
      return ['Perfect 3', 'Solve 3 in a row with 100% accuracy'];
    case Achievement.StreakWise5:
      return ['5 Stars', 'Solve 5 in a row with less than 20 guesses'];
    case Achievement.Reveal40:
      return ['Thorough', 'Reveal at lest 40% of the article'];
    case Achievement.Reveal50:
      return ['Meticulous', 'Reveal at lest 50% of the article'];
    case Achievement.Reveal60:
      return ['Assidous', 'Reveal at lest 60% of the article'];
    case Achievement.Reveal70:
      return ['Hyper', 'Reveal at lest 70% of the article'];
    case Achievement.Reveal80:
      return ['Stubborn', 'Reveal at lest 80% of the article'];
    case Achievement.Reveal90:
      return ['Manic', 'Reveal at lest 90% of the article'];
    case Achievement.Reveal100:
      return ['Complete', 'Reveal at lest 100% of the article'];
    case Achievement.RevealAllHeaders:
      return ['Big Text', 'Reveal all sub-headers completely'];
    case Achievement.RevealSummary90:
      return ['TDLR', 'Reveal at least 90% of the article summary'];
    case Achievement.RankTop10:
      return ['Inspired', 'Guess the 10 most frequent words in the article'];
    case Achievement.RankTop20:
      return ['Mega Brain', 'Guess the 20 most frequent words in the article'];
    case Achievement.RankTop50:
      return ['Giga Brain', 'Guess the 50 most frequent words in the article'];
    case Achievement.RankTop100:
      return ['Galaxy Brain', 'Guess the 100 most frequent words in the article'];
    case Achievement.Achieve50:
      return ['Scholar', 'At any time, unlock at least half of all achievements'];
    case Achievement.Achieve100:
      return ['All-knowing', 'At any time, unlock all achievements'];
    case Achievement.CheckYesterdaysSolution:
      return ['Curious', 'Check yesterday\'s solution'];
    case Achievement.CoopSolo:
      return ['Abandoned', 'Solve a coop game without anyone else joining'];
    case Achievement.CoopWin:
      return ['Team building', 'Solve a coop game as a team'];
    case Achievement.CoopGuessFew:
      return ['Freeloader', 'Make less than one fourth as many guesses than the second least frequent guesser'];
    case Achievement.CoopGuessEqual:
      return ['Sharing is caring', 'Everyone makes within 10% amount of guesses'];
    case Achievement.CoopGuessMany:
      return ['Atlas', 'Make four times as many guesses as the second most frequent guesser'];
    case Achievement.CoopAccuracyLow:
      return ['Free thinker', 'Have less than half the accuracy of the second least accurate guesser'];
    case Achievement.CoopAccuracyHigh:
      return ['Sharp', 'Have more than twice the accuracy of the second most accurate guesser'];
    case Achievement.CoopTitleShare:
      return ['Holding hands', 'Every guesser contridubes to the title'];
    case Achievement.CoopTitleLast:
      return ['The one', 'Reveal the last word of the title'];
    case Achievement.CoopTitleSolo:
      return ['Selfish', 'For an article with multiple words, find all title words alone'];
    default:
      return ['Unknown', 'This achievement doesn\'t exist'];
  }
}

const TOP_GUESSES: Array<[number, Achievement]> = [
  [10, Achievement.RankTop10],
  [20, Achievement.RankTop20],
  [50, Achievement.RankTop50],
  [100, Achievement.RankTop100],
];

export function checkRankAchievements(
  guesses: Array<Guess>,
  rankings: Record<string, number>,
): Achievement[] {
  if (guesses.length === 0) return [];

  const [, topGuesses] = guesses
    .filter(([word, isHint]) => !isHint && rankings[word] !== undefined)
    .map<[string, number]>(([word]) => [word, rankings[word]])
    .sort(([, a], [, b]) => (a > b ? -1 : 1))
    .reduce<[boolean, number]>(([foundAll, count], [lex, rank], idx) => {
      if (
        !foundAll
        || (idx + 1) < rank
        || !guesses.some(([guess, isHint]) => guess === lex && !isHint)
      ) return [false, count];
      return [true, count + 1];
    }, [true, 0]);

  return TOP_GUESSES
    .filter(([threshold]) => threshold <= topGuesses)
    .map(([, achievement]) => achievement);
}

const REVEAL_ACHIEVEMENTS: Array<[number, Achievement]> = [
  [40, Achievement.Reveal40],
  [50, Achievement.Reveal50],
  [60, Achievement.Reveal60],
  [70, Achievement.Reveal70],
  [80, Achievement.Reveal80],
  [90, Achievement.Reveal90],
  [100, Achievement.Reveal100],
];

export function checkRevealAchievements(
  revealed: number,
  solvedHeaders: boolean,
  summaryRevealed: number,
): Achievement[] {
  return [
    ...REVEAL_ACHIEVEMENTS
      .filter(([threshold]) => revealed >= threshold)
      .map(([, achievement]) => achievement),
    ...(solvedHeaders ? [Achievement.RevealAllHeaders] : []),
    ...(
      Number.isFinite(summaryRevealed) && summaryRevealed > 90
        ? [Achievement.RevealSummary90]
        : []
    ),
  ];
}

const GUESSES_ACHIEVEMENTS: Array<[(total: number) => boolean, Achievement]> = [
  [(total) => total < 10, Achievement.GuessSingleDigit],
  [(total) => total < 20 && total >= 10, Achievement.GuessLessThan20],
  [(total) => total === 42, Achievement.Guess42],
  [(total) => total < 50 && total >= 20, Achievement.GuessLessThan50],
  [(total) => total < 100 && total >= 50, Achievement.GuessLessThan100],
  [(total) => total > 500 && total < 1000, Achievement.GuessMoreThan500],
  [(total) => total > 1000, Achievement.GuessMoreThan1000],
];

function checkVictoryGuessTotal(total: number): Achievement[] {
  return GUESSES_ACHIEVEMENTS
    .filter(([check]) => check(total))
    .map(([, achievement]) => achievement);
}

const HINT_ACHIEVEMENTS: Array<[(hints: number) => boolean, Achievement]> = [
  [(hints) => hints === 0, Achievement.HintNone],
  [(hints) => hints <= 3 && hints > 0, Achievement.HintMax3],
  [(hints) => hints <= 10 && hints > 3, Achievement.HintMax10],
  [(hints) => hints >= 100 && hints > 10, Achievement.HintMin100],
];

function checkVictoryHints(hints: number): Achievement[] {
  return HINT_ACHIEVEMENTS
    .filter(([check]) => check(hints))
    .map(([, achievement]) => achievement);
}

const ACCURACY_ACHIEVEMENTS: Array<[(accuracy: number) => boolean, Achievement]> = [
  [(accuracy) => accuracy === 100, Achievement.Accurate100],
  [(accuracy) => accuracy > 90 && accuracy < 100, Achievement.Accurate90],
  [(accuracy) => accuracy > 50 && accuracy <= 90, Achievement.Accurate50],
  [(accuracy) => accuracy < 10, Achievement.AccurateLessThan10],
];

function checkVictoryAccuracy(accuracy: number): Achievement[] {
  return ACCURACY_ACHIEVEMENTS
    .filter(([check]) => check(accuracy))
    .map(([, achievement]) => achievement);
}

function checkSpecialGuessRules(
  guesses: Array<Guess>,
  titleLexes: string[],
  headingLexes: string[],
): Achievement[] {
  const ret: Achievement[] = [];

  if (guesses.every(([word]) => titleLexes.includes(word))) {
    ret.push(Achievement.GuessOnlyTitle);
  }
  if (guesses.every(([word]) => titleLexes.includes(word) || headingLexes.includes(word))) {
    ret.push(Achievement.GuessOnlyHeaders);
  }
  return ret;
}

const withinStreak = (offset: number, length: number): boolean => offset > 0 && offset < length;

const STREAK_ACHIEVEMENTS: Array<[
  (gameId: GameId, victory: VictoryType, history: Array<[GameId, VictoryType]>) => boolean,
  Achievement
]> = [
  [
    (gameId, _, history) => history.filter(([id]) => withinStreak(gameId - id, 3)).length === 2,
    Achievement.Streak3,
  ],
  [
    (gameId, _, history) => history.filter(([id]) => withinStreak(gameId - id, 10)).length === 9,
    Achievement.Streak10],
  [
    (gameId, _, history) => history.filter(([id]) => withinStreak(gameId - id, 30)).length === 29,
    Achievement.Streak30],
  [
    (gameId, victory, history) => (
      victory.accuracy === 100
      && history
        .filter(([id, vic]) => withinStreak(gameId - id, 3) && vic.accuracy === 100).length === 2
    ),
    Achievement.StreakPerfect3,
  ],
  [
    (gameId, victory, history) => (
      victory.guesses < 20
      && history
        .filter(([id, vic]) => withinStreak(gameId - id, 5) && vic.guesses < 20).length === 4
    ),
    Achievement.StreakWise5,
  ],
];

function checkStreak(
  gameId: GameId,
  victory: VictoryType,
  history: Array<[GameId, VictoryType]>,
): Achievement[] {
  return STREAK_ACHIEVEMENTS
    .filter(([check]) => check(gameId, victory, history))
    .map(([, achievement]) => achievement);
}

const SPEED_ACHIEVEMENTS: Array<[(seconds: number) => boolean, Achievement]> = [
  [(seconds) => seconds < 60, Achievement.SpeedOneMinute],
  [(seconds) => seconds < 10 * 60 && seconds >= 60, Achievement.SpeedTenMinutes],
  [(seconds) => seconds < 60 * 60 && seconds >= 10 * 60, Achievement.SpeedOneHour],
];

const EARLY_ACHIEVEMENTS: Array<[(minutes: number) => boolean, Achievement]> = [
  [(minutes) => minutes < 10, Achievement.EarlyTenMinutes],
  [(minutes) => minutes < 60 && minutes >= 10, Achievement.EarlyOneHour],
];

const LATE_ACHIEVEMENTS: Array<[(minutes: number) => boolean, Achievement]> = [
  [(minutes) => minutes < 5 && minutes >= 1, Achievement.LateFiveMinutes],
  [(minutes) => minutes < 1 && minutes >= 0, Achievement.LateLastMinute],
];

function deltaMinutes(
  from: Date | undefined,
  to: Date | undefined,
): number {
  if (from === undefined || to === undefined) return NaN;

  return (
    Math.floor(to.getTime() / 1000)
    - Math.floor(from.getTime() / 1000)
  ) / 60;
}

function checkDurationAchievements(
  playDurationSeconds: number | null,
  playEnd: Date,
  start: Date | undefined,
  end: Date | undefined,
): Achievement[] {
  if (playDurationSeconds === null) return [];

  const longPlay: Achievement[] = (
    playDurationSeconds >= 60 * 60 * 18 ? [Achievement.ThinkOnIt] : []
  );

  const minutesSinceStart = deltaMinutes(start, playEnd);
  const minutesUntilEnd = deltaMinutes(playEnd, end);

  return [
    ...SPEED_ACHIEVEMENTS
      .filter(([check]) => check(playDurationSeconds))
      .map(([, achievement]) => achievement),
    ...longPlay,
    ...EARLY_ACHIEVEMENTS
      .filter(([check]) => start !== undefined && check(minutesSinceStart))
      .map((([, achievement]) => achievement)),
    ...LATE_ACHIEVEMENTS
      .filter(([check]) => end !== undefined && check(minutesUntilEnd))
      .map((([, achievement]) => achievement)),
  ];
}

const GAME_MODE_ACHIEVEMENTS: Array<[(mode: GameMode, minutes: number) => boolean, Achievement]> = [
  [(gameMode) => gameMode === 'yesterday', Achievement.LateYesterdays],
  [(gameMode, minutes) => gameMode === 'today' && minutes < 0, Achievement.LateOverdue],
];

function gameModeSpecificAchievements(
  gameMode: GameMode,
  playEnd: Date,
  end: Date | undefined,
): Achievement[] {
  const minutesUntilEnd = deltaMinutes(playEnd, end);

  return GAME_MODE_ACHIEVEMENTS
    .filter(([check]) => check(gameMode, minutesUntilEnd))
    .map(([, achievement]) => achievement);
}

export function checkVictoryAchievements(
  gameMode: GameMode,
  gameId: GameId,
  victory: VictoryType,
  guesses: Array<Guess>,
  titleLexes: string[],
  headingLexes: string[],
  history: Array<[GameId, VictoryType]>,
  playDurationSeconds: number | null,
  playEnd: Date,
  start: Date | undefined,
  end: Date | undefined,
): Achievement[] {
  return [
    Achievement.FirstWin,
    ...gameModeSpecificAchievements(gameMode, playEnd, end),
    ...checkVictoryGuessTotal(victory.guesses + victory.hints),
    ...checkVictoryHints(victory.hints),
    ...checkVictoryAccuracy(victory.accuracy),
    ...checkSpecialGuessRules(guesses, titleLexes, headingLexes),
    ...checkStreak(gameId, victory, history),
    ...checkDurationAchievements(playDurationSeconds, playEnd, start, end),
  ];
}

export function checkAchievementsPercent(
  achievements: AchievementsType,
): Achievement[] {
  const gotten = Object.values(achievements).filter((gameId) => gameId !== undefined).length;
  const total = Object.keys(Achievement).length;
  const ret: Achievement[] = [];

  if (gotten / total >= 0.5) {
    ret.push(Achievement.Achieve50);
  }
  if (gotten === total) {
    ret.push(Achievement.Achieve100);
  }
  return ret;
}

const COOP_GUESS_COUNT_ACHIVEMENTS: Array<[
  (
    guesses: Record<string, number>,
    user: string,
    nGuessers: number
  ) => boolean, Achievement
]> = [
  [
    (guesses, user, nGuessers) => guesses[user] > 0 && nGuessers > 1,
    Achievement.CoopWin,
  ],
  [
    (guesses, user, nGuessers) => guesses[user] > 0 && nGuessers === 1,
    Achievement.CoopSolo,
  ],
  [
    (guesses, user, nGuessers) => guesses[user] > 0 && nGuessers > 1
      && Object.values(guesses).every((value, _, arr) => within(avg(arr), value, 0.1)),
    Achievement.CoopGuessEqual,
  ],
  [
    (guesses, user, nGuessers) => nGuessers > 1
      && smaller(Object.values(guesses).sort()[1], guesses[user], 0.25),
    Achievement.CoopGuessFew,
  ],
  [
    (guesses, user, nGuessers) => nGuessers > 1
      && larger(relIndexed(Object.values(guesses).sort(), -2), guesses[user], 4),
    Achievement.CoopGuessMany,
  ],
];

const COOP_GUESS_ACCURACY_ACHIVEMENTS: Array<[
  (
    accuracies: Record<string, number>,
    user: string,
    nGuessers: number,
  ) => boolean, Achievement
]> = [
  [
    (accuracies, user, nGuessers) => nGuessers > 1
      && smaller(Object.values(accuracies).sort()[1], accuracies[user], 0.5),
    Achievement.CoopGuessFew,
  ],
  [
    (accuracies, user, nGuessers) => nGuessers > 1 && larger(
      relIndexed(Object.values(accuracies).sort(), -2),
      accuracies[user],
      2,
    ),
    Achievement.CoopGuessMany,
  ],
];

export function checkCoopVictoryAchievements(
  username: string,
  guesses: Guess[],
  lexicon: Record<string, number>,
  titleLexes: string[],
): Achievement[] {
  const userGuesses = guesses
    .reduce<Record<string, number>>((acc, [_, __, user]) => {
      if (user === null) return acc;
      acc[user] = (acc[user] ?? 0) + 1;
      return acc;
    }, {});
  const hitGuesses = guesses
    .reduce<Record<string, number>>((acc, [lex, _, user]) => {
      if (user === null || (lexicon[lex] ?? 0) === 0) return acc;
      acc[user] = (acc[user] ?? 0) + 1;
      return acc;
    }, {});
  const accuracies = Object.fromEntries(
    Object
      .entries(userGuesses)
      .map(([user, count]) => [user, (hitGuesses[user] ?? 0) / count]),
  );
  const titleGuesses = guesses
    .reduce<Record<string, true>>((acc, [lex, _, user]) => {
      if (user === null || !titleLexes.some((titleLex) => lex === titleLex)) return acc;
      acc[user] = true;
      return acc;
    }, {});

  const nGuessers = Object.keys(guesses).length;
  const nTitleGuessers = Object.keys(titleGuesses).length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, __, solver] = relIndexed(
    guesses
      .filter(([lex]) => titleLexes.includes(lex)),
    -1,
    ['', false, null],
  );

  return [
    ...COOP_GUESS_COUNT_ACHIVEMENTS
      .filter(([check]) => check(userGuesses, username, nGuessers))
      .map(([, achievement]) => achievement),
    ...COOP_GUESS_ACCURACY_ACHIVEMENTS
      .filter(([check]) => check(accuracies, username, nGuessers))
      .map(([, achievement]) => achievement),
    nGuessers > 1 && nGuessers === nTitleGuessers ? Achievement.CoopTitleShare : null,
    nGuessers > 1 && nTitleGuessers === 1 ? Achievement.CoopTitleSolo : null,
    nGuessers > 1 && solver === username ? Achievement.CoopTitleLast : null,
  ].filter(isDefined);
}

export function updateAchievements(
  achievements: AchievementsType,
  newAchievements: Achievement[],
  gameId: Game,
): AchievementsType {
  return {
    ...achievements,
    ...Object.fromEntries(newAchievements.map((a) => [a, gameId])),
  };
}
