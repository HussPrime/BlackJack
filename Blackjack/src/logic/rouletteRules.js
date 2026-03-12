// ── Named constants ────────────────────────────────────────────────────────────
export const EUROPEAN_ZERO = 0;

export const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18,
  19, 21, 23, 25, 27, 30, 32, 34, 36,
];

// European single-zero wheel order (clockwise, authentic casino layout)
export const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

// Payout multipliers — profit per unit wagered (e.g. 35 means 35:1 → returns 36×)
export const PAYOUTS = {
  straight: 35,
  split:    17,
  street:   11,
  corner:    8,
  sixline:   5,
  column:    2,
  dozen:     2,
  red:  1, black: 1,
  odd:  1, even:  1,
  low:  1, high:  1,
};

// Chip denominations and their display colours
export const CHIP_DENOMS = [1, 5, 25, 100, 500];
export const CHIP_COLORS = {
  1:   '#ddd',
  5:   '#e74c3c',
  25:  '#2ecc71',
  100: '#333',
  500: '#9b59b6',
};
export const CHIP_TEXT_COLORS = {
  1:   '#333',
  5:   '#fff',
  25:  '#fff',
  100: '#ffd700',
  500: '#fff',
};

// ── Cryptographically-secure RNG ───────────────────────────────────────────────
/**
 * Returns a uniformly distributed integer 0–36 using rejection sampling
 * to eliminate modulo bias.
 */
export function cryptoSpin() {
  const RANGE = 37;
  const LIMIT = Math.floor(0x100000000 / RANGE) * RANGE; // largest multiple of 37 ≤ 2^32
  const arr = new Uint32Array(1);
  let val;
  do {
    crypto.getRandomValues(arr);
    val = arr[0];
  } while (val >= LIMIT);
  return val % RANGE;
}

// ── Color helpers ──────────────────────────────────────────────────────────────
export function getColor(n) {
  if (n === EUROPEAN_ZERO) return 'green';
  return RED_NUMBERS.includes(n) ? 'red' : 'black';
}

// ── Street (row) helpers ────────────────────────────────────────────────────────
/** Numbers covered by street (row) index ri (0-based, covers ri*3+1..ri*3+3). */
export function streetNums(ri) {
  return [ri * 3 + 1, ri * 3 + 2, ri * 3 + 3];
}

/** Numbers covered by a six-line bet on rows ri and ri+1. */
export function sixlineNums(ri) {
  return [...streetNums(ri), ...streetNums(ri + 1)];
}

// ── Bet win-check ──────────────────────────────────────────────────────────────
/**
 * Returns true if the bet wins.
 * @param {string}   type   - bet type key (matches PAYOUTS)
 * @param {number[]} nums   - numbers the bet covers
 * @param {number}   result - winning number 0–36
 */
export function checkBet(type, nums, result) {
  // Straight bets win on zero like any other number
  if (type === 'straight') return result === nums[0];

  // All outside / combination bets lose on zero (house edge)
  if (result === EUROPEAN_ZERO) return false;

  if (type === 'split'  ) return nums.includes(result);
  if (type === 'street' ) return nums.includes(result);
  if (type === 'corner' ) return nums.includes(result);
  if (type === 'sixline') return nums.includes(result);

  if (type === 'column') {
    const col = nums[0]; // 1, 2, or 3
    if (col === 3) return result % 3 === 0;
    return result % 3 === col;
  }

  if (type === 'dozen') {
    const d = nums[0]; // 1, 2, or 3
    if (d === 1) return result >= 1  && result <= 12;
    if (d === 2) return result >= 13 && result <= 24;
    return result >= 25 && result <= 36;
  }

  if (type === 'red'  ) return RED_NUMBERS.includes(result);
  if (type === 'black') return !RED_NUMBERS.includes(result);
  if (type === 'odd'  ) return result % 2 === 1;
  if (type === 'even' ) return result % 2 === 0;
  if (type === 'low'  ) return result >= 1  && result <= 18;
  if (type === 'high' ) return result >= 19 && result <= 36;

  return false;
}

// ── Resolve a full set of bets ─────────────────────────────────────────────────
/**
 * @param {Array}  bets   - [{id, type, nums, amount}]
 * @param {number} result - winning number
 * @returns {{ returned: number, wonIds: Set<string> }}
 *   returned = total chips returned to player (stakes + profits of winners)
 */
export function resolveAllBets(bets, result) {
  let returned = 0;
  const wonIds = new Set();
  for (const bet of bets) {
    if (checkBet(bet.type, bet.nums, result)) {
      returned += bet.amount * (PAYOUTS[bet.type] + 1);
      wonIds.add(bet.id);
    }
  }
  return { returned, wonIds };
}

// ── Statistics helpers ─────────────────────────────────────────────────────────
/**
 * Return the N most-frequently seen numbers in history (last-N spins array).
 * @param {number[]} history
 * @param {number}   n
 * @returns {{ num: number, count: number }[]}
 */
export function getHotNumbers(history, n = 5) {
  const freq = {};
  for (const num of history) freq[num] = (freq[num] || 0) + 1;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([num, count]) => ({ num: Number(num), count }));
}
