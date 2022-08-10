import { GameMode } from '../api/page';
import { Guess } from '../components/Guess';
import { VictoryType } from '../components/VictoryType';
import {
  Achievement, checkAchievementsPercent, checkCoopVictoryAchievements, checkDurationAchievements,
  checkRankAchievements, checkRevealAchievements, checkSpecialGuessRules,
  checkStreak, checkVictoryAccuracy, checkVictoryAchievements,
  checkVictoryGuessTotal,
  checkVictoryHints, GameId, gameModeSpecificAchievements,
} from './achievements';

function g(
  word: string,
  { isHint = false, user = null }: { user?: string | null, isHint?: boolean } = {},
): Guess { return [word, isHint, user ?? null]; }

describe('checkRankAchievements()', () => {
  const rankings: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
  };
  const topGuesses = [
    g('two'), g('three'), g('five'), g('one'), g('four'), g('sick'), g('six'),
    g('seven'), g('eight'), g('nine'), g('ten'),
  ];

  it.each([
    [[], []],
    [topGuesses, [Achievement.RankTop10]],
    [topGuesses.slice(1, 5), []],
    [[g('eleven'), ...topGuesses], [Achievement.RankTop10]],
  ])('returns expected achievements', (guesses, achivements) => {
    expect(checkRankAchievements(guesses, rankings)).toEqual(achivements);
  });
});

describe('checkRevealAchievements()', () => {
  it.each([
    [20, false, 0, []],
    [39, true, 10, [Achievement.RevealAllHeaders]],
    [40, false, 90, [Achievement.Reveal40]],
    [91, false, 91, [
      Achievement.Reveal40,
      Achievement.Reveal50,
      Achievement.Reveal60,
      Achievement.Reveal70,
      Achievement.Reveal80,
      Achievement.Reveal90,
      Achievement.RevealSummary90,
    ]],
  ])(
    'returns expected achievements',
    (revealed, solvedHeaders, summaryRevealed, achievements) => {
      expect(checkRevealAchievements(revealed, solvedHeaders, summaryRevealed))
        .toEqual(achievements);
    },
  );
});

describe('checkVictoryGuessTotal()', () => {
  it.each([
    [1, [Achievement.GuessSingleDigit]],
    [9, [Achievement.GuessSingleDigit]],
    [10, [Achievement.GuessLessThan20]],
    [19, [Achievement.GuessLessThan20]],
    [20, [Achievement.GuessLessThan50]],
    [42, [Achievement.Guess42, Achievement.GuessLessThan50]],
    [49, [Achievement.GuessLessThan50]],
    [50, [Achievement.GuessLessThan100]],
    [99, [Achievement.GuessLessThan100]],
    [100, []],
    [500, []],
    [501, [Achievement.GuessMoreThan500]],
    [1000, [Achievement.GuessMoreThan500]],
    [1001, [Achievement.GuessMoreThan1000]],
  ])('returns expected achievement', (total, achievements) => {
    expect(checkVictoryGuessTotal(total)).toEqual(achievements);
  });
});

describe('checkVictoryHints()', () => {
  it.each([
    [0, [Achievement.HintNone]],
    [1, [Achievement.HintMax3]],
    [3, [Achievement.HintMax3]],
    [4, [Achievement.HintMax10]],
    [10, [Achievement.HintMax10]],
    [11, []],
    [100, [Achievement.HintMin100]],
    [999, [Achievement.HintMin100]],
  ])('returns expected achievements', (hints, achievement) => {
    expect(checkVictoryHints(hints)).toEqual(achievement);
  });
});

describe('checkVictoryAccuracy()', () => {
  it.each([
    [0, [Achievement.AccurateLessThan10]],
    [9.99, [Achievement.AccurateLessThan10]],
    [10, []],
    [50, []],
    [51, [Achievement.Accurate50]],
    [90, [Achievement.Accurate50]],
    [91, [Achievement.Accurate90]],
    [99, [Achievement.Accurate90]],
    [100, [Achievement.Accurate100]],
  ])('returns expected achievements', (accuracy, achievements) => {
    expect(checkVictoryAccuracy(accuracy)).toEqual(achievements);
  });
});

describe('checkSpecialGuessRules()', () => {
  const allGuesses = [g('a'), g('b'), g('c'), g('d'), g('e')];
  const titleLexes = ['b', 'c', 'c'];
  const headingLexes = ['a', 'd', 'd', 'a'];
  it.each([
    [allGuesses, []],
    [[g('b'), g('c')], [Achievement.GuessOnlyTitle]],
    [[g('b'), g('c'), g('d')], [Achievement.GuessOnlyHeaders]],
    [[g('b'), g('c'), g('d'), g('a')], [Achievement.GuessOnlyHeaders]],
    [[], []],
  ])('returns expected achievements', (guesses, achievements) => {
    expect(checkSpecialGuessRules(guesses, titleLexes, headingLexes)).toEqual(achievements);
  });
});

function v({
  pageName = 'page_name',
  guesses = 50,
  hints = 5,
  revealed = 30,
  accuracy = 80,
} = {}): VictoryType {
  return {
    pageName,
    hints,
    guesses,
    revealed,
    accuracy,
  };
}

describe('checkStreak()', () => {
  it.each<[
    number,
    VictoryType,
    Array<[GameId, VictoryType]>,
    Achievement[],
  ]>([
    [0, v(), [], []],
    [10, v(), [[9, v()], [8, v()]], [Achievement.Streak3]],
    [11, v(), [[9, v()], [8, v()]], []],
    [
      10,
      v(),
      [
        [9, v()], [8, v()], [7, v()], [6, v()], [5, v()],
        [4, v()], [3, v()], [2, v()],
      ],
      [Achievement.Streak3],
    ],
    [
      10,
      v(),
      [
        [9, v()], [8, v()], [7, v()], [6, v()], [5, v()],
        [4, v()], [3, v()], [2, v()], [1, v()],
      ],
      [Achievement.Streak3, Achievement.Streak10],
    ],
    [
      10,
      v({ guesses: 1 }),
      [
        [9, v({ guesses: 10 })],
        [8, v({ guesses: 19 })],
        [7, v({ guesses: 9 })],
        [6, v({ guesses: 5 })],
      ],
      [Achievement.Streak3, Achievement.StreakWise5],
    ],
    [
      10,
      v({ guesses: 1 }),
      [
        [9, v({ guesses: 10 })],
        [8, v({ guesses: 20 })],
        [7, v({ guesses: 9 })],
        [6, v({ guesses: 5 })],
      ],
      [Achievement.Streak3],
    ],
    [
      10,
      v({ guesses: 1 }),
      [
        [9, v({ guesses: 10 })],
        [8, v({ guesses: 20 })],
        [7, v({ guesses: 9 })],
        [6, v({ guesses: 5 })],
        [5, v({ guesses: 2 })],
      ],
      [Achievement.Streak3],
    ],
    [
      10,
      v({ accuracy: 100 }),
      [
        [9, v({ accuracy: 100 })],
        [8, v({ accuracy: 100 })],
      ],
      [Achievement.Streak3, Achievement.StreakPerfect3],
    ],
    [
      10,
      v({ accuracy: 100 }),
      [
        [9, v({ accuracy: 100 })],
        [8, v({ accuracy: 99 })],
      ],
      [Achievement.Streak3],
    ],
    [
      10,
      v({ accuracy: 100 }),
      [
        [9, v({ accuracy: 100 })],
        [8, v({ accuracy: 99 })],
        [7, v({ accuracy: 100 })],
      ],
      [Achievement.Streak3],
    ],
  ])('returns expected achievements', (gameId, victory, history, achievements) => {
    expect(checkStreak(gameId, victory, history)).toEqual(achievements);
  });
});

function c(date: Date, hour = 0, minute = 0, second = 0): Date {
  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(second);
  date.setMilliseconds(0);
  return date;
}

function shiftC(date: Date, hour = 0, minute = 0, second = 0): Date {
  date.setHours(date.getHours() + hour);
  date.setMinutes(date.getMinutes() + minute);
  date.setSeconds(date.getSeconds() + second);
  return date;
}

describe('checkDurationAchievements()', () => {
  const realStart = c(new Date());
  const realEnd = shiftC(new Date(realStart), 24);

  it.each([
    [null, new Date(), undefined, undefined, []],
    [0, new Date(), undefined, undefined, [Achievement.SpeedOneMinute]],
    [59, new Date(), undefined, undefined, [Achievement.SpeedOneMinute]],
    [60, new Date(), undefined, undefined, [Achievement.SpeedTenMinutes]],
    [599, new Date(), undefined, undefined, [Achievement.SpeedTenMinutes]],
    [600, new Date(), undefined, undefined, [Achievement.SpeedOneHour]],
    [60 * 59, new Date(), undefined, undefined, [Achievement.SpeedOneHour]],
    [60 * 60, new Date(), undefined, undefined, []],
    [60 * 60 * 18 - 1, new Date(), undefined, undefined, []],
    [60 * 60 * 18, new Date(), undefined, undefined, [Achievement.ThinkOnIt]],
    [60 * 60, shiftC(new Date(realStart), 15), realStart, realEnd, []],
    [60 * 60, shiftC(new Date(realStart)), realStart, realEnd, [Achievement.EarlyTenMinutes]],
    [60 * 60, shiftC(new Date(realStart), 0, 9), realStart, realEnd, [Achievement.EarlyTenMinutes]],
    [60 * 60, shiftC(new Date(realStart), 0, 10), realStart, realEnd, [Achievement.EarlyOneHour]],
    [60 * 60, shiftC(new Date(realStart), 0, 59), realStart, realEnd, [Achievement.EarlyOneHour]],
    [60 * 60, shiftC(new Date(realStart), 1, 0), realStart, realEnd, []],
    [60 * 60, shiftC(new Date(realStart), 23, 55), realStart, realEnd, []],
    [
      60 * 60,
      shiftC(new Date(realStart), 23, 56),
      realStart,
      realEnd,
      [Achievement.LateFiveMinutes],
    ],
    [
      60 * 60,
      shiftC(new Date(realStart), 23, 59),
      realStart,
      realEnd,
      [Achievement.LateFiveMinutes],
    ],
    [
      60 * 60,
      shiftC(new Date(realStart), 23, 59, 1),
      realStart,
      realEnd,
      [Achievement.LateLastMinute],
    ],
    [
      60 * 60,
      shiftC(new Date(realStart), 24),
      realStart,
      realEnd,
      [Achievement.LateLastMinute],
    ],
    [
      60 * 60,
      shiftC(new Date(realStart), 24, 0, 1),
      realStart,
      realEnd,
      [],
    ],
  ])(
    'returns expected achievements',
    (playDurationSeconds, playEnd, start, end, achievements) => {
      expect(checkDurationAchievements(
        playDurationSeconds,
        playEnd,
        start,
        end,
      )).toEqual(achievements);
    },
  );
});

describe('gameModeSpecificAcheivements()', () => {
  const playEnd = c(new Date());
  it.each<[
    GameMode,
    Date | undefined,
    Achievement[],
  ]>([
    ['coop', shiftC(new Date(playEnd), 0, 0, -1), []],
    ['yesterday', shiftC(new Date(playEnd), 0, 0, -1), [Achievement.LateYesterdays]],
    ['today', undefined, []],
    ['today', shiftC(new Date(playEnd), 0, -1, 0), [Achievement.LateOverdue]],
    ['today', shiftC(new Date(playEnd), 0, 1, 0), []],
  ])('returns the expected achievements', (gameMode, end, achievements) => {
    expect(gameModeSpecificAchievements(gameMode, playEnd, end))
      .toEqual(achievements);
  });
});

describe('checkVictoryAchievments()', () => {
  it('always contains FirstWin', () => {
    expect(checkVictoryAchievements(
      'today',
      12,
      v(),
      [],
      [],
      [],
      [],
      null,
      new Date(),
      undefined,
      undefined,
    )).toEqual(expect.arrayContaining([Achievement.FirstWin]));
  });
});

describe('checkAchivementsPercent()', () => {
  it.each([
    [0, []],
    [0.45, []],
    [0.5, [Achievement.Achieve50]],
    [0.95, [Achievement.Achieve50]],
    [1, [Achievement.Achieve50, Achievement.Achieve100]],
  ])('returns expected achievements', (fraction, achievements) => {
    const threshold = fraction * Object.values(Achievement).length;
    const gotten = Object.fromEntries(
      Object.values(Achievement).filter((_, idx) => idx < threshold).map(((a, idx) => [a, idx])),
    );
    expect(checkAchievementsPercent(gotten)).toEqual(achievements);
  });
});

describe('checkCoopVictoryAchievements()', () => {
  it.each([
    ['me', [], {}, [], []],
    ['me', [g('a', { user: 'me' })], {}, [], [Achievement.CoopSolo]],
    [
      'me',
      [g('a', { user: 'me' }), g('b', { user: 'you' })],
      {},
      [],
      [Achievement.CoopWin, Achievement.CoopGuessEqual],
    ],
    [
      'me',
      [
        g('a', { user: 'me' }),
        g('b', { user: 'you' }),
        g('c', { user: 'you' }),
        g('d', { user: 'you' }),
        g('e', { user: 'you' }),
        g('f', { user: 'you' }),
      ],
      {},
      [],
      [Achievement.CoopWin, Achievement.CoopGuessFew],
    ],
    [
      'me',
      [
        g('a', { user: 'me' }),
        g('b', { user: 'you' }),
        g('c', { user: 'you' }),
        g('d', { user: 'you' }),
        g('e', { user: 'you' }),
      ],
      {},
      [],
      [Achievement.CoopWin],
    ],
    [
      'you',
      [
        g('a', { user: 'me' }),
        g('b', { user: 'you' }),
        g('c', { user: 'you' }),
        g('d', { user: 'you' }),
        g('e', { user: 'you' }),
      ],
      {},
      [],
      [Achievement.CoopWin],
    ],
    [
      'you',
      [
        g('a', { user: 'me' }),
        g('b', { user: 'you' }),
        g('c', { user: 'you' }),
        g('d', { user: 'you' }),
        g('e', { user: 'you' }),
        g('f', { user: 'you' }),
      ],
      {},
      [],
      [Achievement.CoopWin, Achievement.CoopGuessMany],
    ],
    [
      'me',
      [
        g('a', { user: 'me' }),
        g('b', { user: 'me' }),
        g('c', { user: 'you' }),
        g('d', { user: 'you' }),
        g('e', { user: 'you' }),
        g('f', { user: 'you' }),
      ],
      { a: 100, b: 200, c: 13 },
      [],
      [Achievement.CoopWin, Achievement.CoopAccuracyHigh],
    ],
    [
      'me',
      [
        g('a', { user: 'me' }),
        g('b', { user: 'me' }),
        g('c', { user: 'you' }),
        g('d', { user: 'you' }),
        g('e', { user: 'you' }),
        g('f', { user: 'you' }),
      ],
      { a: 100, b: 200, c: 13, d: 12 },
      [],
      [Achievement.CoopWin],
    ],
    [
      'me',
      [
        g('a', { user: 'me' }),
        g('b', { user: 'me' }),
        g('x', { user: 'me' }),
        g('c', { user: 'you' }),
        g('d', { user: 'you' }),
        g('e', { user: 'you' }),
        g('f', { user: 'you' }),
      ],
      { a: 100, c: 13, d: 1, e: 5, f: 9 },
      [],
      [Achievement.CoopWin, Achievement.CoopAccuracyLow],
    ],
    [
      'me',
      [
        g('a', { user: 'me' }),
        g('b', { user: 'me' }),
        g('c', { user: 'you' }),
        g('d', { user: 'you' }),
        g('e', { user: 'you' }),
        g('f', { user: 'you' }),
      ],
      { a: 100, c: 13, d: 1, e: 5, f: 9 },
      [],
      [Achievement.CoopWin],
    ],
    [
      'me',
      [
        g('a', { user: 'me' }),
        g('b', { user: 'me' }),
        g('c', { user: 'you' }),
        g('d', { user: 'you' }),
        g('e', { user: 'everyone' }),
        g('f', { user: 'everyone' }),
        g('g', { user: 'everyone' }),
      ],
      {},
      ['a', 'c', 'e'],
      [Achievement.CoopWin, Achievement.CoopTitleShare],
    ],
    [
      'me',
      [
        g('a', { user: 'me' }),
        g('b', { user: 'me' }),
        g('c', { user: 'you' }),
        g('d', { user: 'you' }),
        g('e', { user: 'everyone' }),
        g('f', { user: 'everyone' }),
        g('g', { user: 'everyone' }),
      ],
      {},
      ['a', 'e'],
      [Achievement.CoopWin],
    ],
    [
      'everyone',
      [
        g('a', { user: 'me' }),
        g('b', { user: 'me' }),
        g('c', { user: 'you' }),
        g('d', { user: 'you' }),
        g('e', { user: 'everyone' }),
        g('f', { user: 'everyone' }),
        g('g', { user: 'everyone' }),
      ],
      {},
      ['e', 'a'],
      [Achievement.CoopWin, Achievement.CoopTitleLast],
    ],
    [
      'me',
      [
        g('a', { user: 'me' }),
        g('b', { user: 'me' }),
        g('c', { user: 'you' }),
        g('d', { user: 'you' }),
        g('e', { user: 'everyone' }),
        g('f', { user: 'everyone' }),
        g('g', { user: 'everyone' }),
      ],
      {},
      ['b', 'a'],
      [Achievement.CoopWin, Achievement.CoopTitleSolo],
    ],
  ])('returns expected achievements', (username, guesses, lexicon, titleLexes, achievements) => {
    expect(checkCoopVictoryAchievements(username, guesses, lexicon, titleLexes))
      .toEqual(achievements);
  });
});
