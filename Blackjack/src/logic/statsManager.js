/**
 * Persistent statistics tracker for Blackjack sessions.
 * Stats are saved to localStorage so they survive page refreshes.
 */

const STORAGE_KEY = 'blackjack_stats';

/** @type {Stats} Default empty stats object */
const DEFAULT_STATS = {
  handsPlayed: 0,
  wins: 0,
  losses: 0,
  pushes: 0,
  /** Player blackjacks (natural 21 on first two cards) */
  blackjacks: 0,
  /** Hands where the player busted (>21) */
  busts: 0,
  /**
   * Current streak: positive = consecutive wins, negative = consecutive losses.
   * A push resets the streak to 0.
   */
  currentStreak: 0,
  longestWinStreak: 0,
  longestLossStreak: 0,
  /** Cumulative net profit/loss in chips since stats were last reset */
  netProfit: 0,
};

/**
 * Load stats from localStorage.
 * Falls back to defaults if nothing is stored or storage is unavailable.
 *
 * @returns {object} Stats object
 */
export function loadStats() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_STATS, ...JSON.parse(saved) };
  } catch {
    // private browsing, quota exceeded, etc.
  }
  return { ...DEFAULT_STATS };
}

/**
 * Persist a stats object to localStorage.
 *
 * @param {object} stats
 */
export function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch { /* silent */ }
}

/**
 * Reset all stats and persist the blank slate.
 *
 * @returns {object} Fresh default stats
 */
export function resetStats() {
  const fresh = { ...DEFAULT_STATS };
  saveStats(fresh);
  return fresh;
}

/**
 * Record the outcome of a completed hand and return an updated copy of stats.
 * Also persists the update to localStorage.
 *
 * @param {object}  stats       - Current stats snapshot
 * @param {'win'|'loss'|'push'|'blackjack'} outcome
 * @param {boolean} playerBusted - Whether the player went over 21
 * @param {number}  netChange   - Chip change for this hand (positive = profit)
 * @returns {object} Updated stats (immutable copy of `stats`)
 */
export function recordHand(stats, outcome, playerBusted, netChange) {
  const s = { ...stats };

  s.handsPlayed++;
  s.netProfit += netChange;
  if (playerBusted) s.busts++;

  if (outcome === 'blackjack') {
    s.wins++;
    s.blackjacks++;
    s.currentStreak = s.currentStreak > 0 ? s.currentStreak + 1 : 1;
  } else if (outcome === 'win') {
    s.wins++;
    s.currentStreak = s.currentStreak > 0 ? s.currentStreak + 1 : 1;
  } else if (outcome === 'loss') {
    s.losses++;
    s.currentStreak = s.currentStreak < 0 ? s.currentStreak - 1 : -1;
  } else {
    // push
    s.pushes++;
    s.currentStreak = 0;
  }

  if (s.currentStreak > s.longestWinStreak) s.longestWinStreak = s.currentStreak;
  if (-s.currentStreak > s.longestLossStreak) s.longestLossStreak = -s.currentStreak;

  saveStats(s);
  return s;
}

/**
 * Win percentage as a string with one decimal place (e.g. "43.2").
 * Pushes are excluded from the win-rate calculation.
 *
 * @param {object} stats
 * @returns {string}
 */
export function getWinRate(stats) {
  if (stats.handsPlayed === 0) return '0.0';
  return ((stats.wins / stats.handsPlayed) * 100).toFixed(1);
}

/**
 * Player bust percentage as a string with one decimal place.
 *
 * @param {object} stats
 * @returns {string}
 */
export function getBustRate(stats) {
  if (stats.handsPlayed === 0) return '0.0';
  return ((stats.busts / stats.handsPlayed) * 100).toFixed(1);
}

/**
 * Return a human-readable streak description.
 *
 * @param {number} streak
 * @returns {string}
 */
export function describeStreak(streak) {
  if (streak === 0) return 'None';
  if (streak > 0) return `${streak} win${streak > 1 ? 's' : ''}`;
  return `${-streak} loss${-streak > 1 ? 'es' : ''}`;
}
