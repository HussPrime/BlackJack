import { describe, it, expect } from 'vitest';
import {
  EUROPEAN_ZERO,
  RED_NUMBERS,
  PAYOUTS,
  CHIP_DENOMS,
  getColor,
  checkBet,
  resolveAllBets,
  getHotNumbers,
  streetNums,
  sixlineNums,
} from '../rouletteRules';

// ── getColor ───────────────────────────────────────────────────────────────────
describe('getColor', () => {
  it('returns green for 0', () => {
    expect(getColor(0)).toBe('green');
  });

  it('returns red for all RED_NUMBERS', () => {
    for (const n of RED_NUMBERS) {
      expect(getColor(n)).toBe('red');
    }
  });

  it('returns black for non-zero non-red numbers', () => {
    const blacks = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
    for (const n of blacks) {
      expect(getColor(n)).toBe('black');
    }
  });

  it('covers all 37 numbers exactly', () => {
    const colors = Array.from({ length: 37 }, (_, i) => getColor(i));
    expect(colors.filter(c => c === 'green').length).toBe(1);
    expect(colors.filter(c => c === 'red').length).toBe(18);
    expect(colors.filter(c => c === 'black').length).toBe(18);
  });
});

// ── streetNums / sixlineNums ───────────────────────────────────────────────────
describe('streetNums', () => {
  it('row 0 → [1,2,3]',   () => expect(streetNums(0)).toEqual([1, 2, 3]));
  it('row 11 → [34,35,36]', () => expect(streetNums(11)).toEqual([34, 35, 36]));
});

describe('sixlineNums', () => {
  it('rows 0-1 → [1..6]', () => expect(sixlineNums(0)).toEqual([1,2,3,4,5,6]));
  it('has 6 elements',     () => expect(sixlineNums(5)).toHaveLength(6));
});

// ── checkBet ──────────────────────────────────────────────────────────────────
describe('checkBet — straight', () => {
  it('wins on correct number',        () => expect(checkBet('straight', [17], 17)).toBe(true));
  it('loses on other number',         () => expect(checkBet('straight', [17], 5)).toBe(false));
  it('straight-0 wins when result=0', () => expect(checkBet('straight', [0], 0)).toBe(true));
});

describe('checkBet — zero loses all outside bets', () => {
  const outsideBets = ['red','black','odd','even','low','high','dozen','column','split','street','sixline'];
  for (const type of outsideBets) {
    it(`${type} loses on zero`, () => {
      expect(checkBet(type, [1], EUROPEAN_ZERO)).toBe(false);
    });
  }
});

describe('checkBet — red / black', () => {
  it('red wins on red number',    () => expect(checkBet('red',   [], 1)).toBe(true));
  it('red loses on black number', () => expect(checkBet('red',   [], 2)).toBe(false));
  it('black wins on black number',() => expect(checkBet('black', [], 2)).toBe(true));
  it('black loses on red number', () => expect(checkBet('black', [], 1)).toBe(false));
});

describe('checkBet — odd / even', () => {
  it('odd wins on odd',    () => expect(checkBet('odd',  [], 7)).toBe(true));
  it('odd loses on even',  () => expect(checkBet('odd',  [], 8)).toBe(false));
  it('even wins on even',  () => expect(checkBet('even', [], 8)).toBe(true));
  it('even loses on odd',  () => expect(checkBet('even', [], 7)).toBe(false));
});

describe('checkBet — low / high', () => {
  it('low wins on 1',  () => expect(checkBet('low',  [], 1)).toBe(true));
  it('low wins on 18', () => expect(checkBet('low',  [], 18)).toBe(true));
  it('low loses on 19',() => expect(checkBet('low',  [], 19)).toBe(false));
  it('high wins on 19',() => expect(checkBet('high', [], 19)).toBe(true));
  it('high wins on 36',() => expect(checkBet('high', [], 36)).toBe(true));
  it('high loses on 18',()=> expect(checkBet('high', [], 18)).toBe(false));
});

describe('checkBet — dozens', () => {
  it('dozen1 wins on 1',  () => expect(checkBet('dozen', [1], 1)).toBe(true));
  it('dozen1 wins on 12', () => expect(checkBet('dozen', [1], 12)).toBe(true));
  it('dozen1 loses on 13',() => expect(checkBet('dozen', [1], 13)).toBe(false));
  it('dozen2 wins on 13', () => expect(checkBet('dozen', [2], 13)).toBe(true));
  it('dozen2 wins on 24', () => expect(checkBet('dozen', [2], 24)).toBe(true));
  it('dozen3 wins on 25', () => expect(checkBet('dozen', [3], 25)).toBe(true));
  it('dozen3 wins on 36', () => expect(checkBet('dozen', [3], 36)).toBe(true));
});

describe('checkBet — columns', () => {
  it('col1 wins on 1 (1%3===1)',  () => expect(checkBet('column', [1], 1)).toBe(true));
  it('col1 wins on 34 (34%3===1)',() => expect(checkBet('column', [1], 34)).toBe(true));
  it('col2 wins on 2 (2%3===2)',  () => expect(checkBet('column', [2], 2)).toBe(true));
  it('col3 wins on 3 (3%3===0)',  () => expect(checkBet('column', [3], 3)).toBe(true));
  it('col3 wins on 36 (36%3===0)',() => expect(checkBet('column', [3], 36)).toBe(true));
  it('col1 loses on 2',           () => expect(checkBet('column', [1], 2)).toBe(false));
});

describe('checkBet — street', () => {
  it('wins when result is in the 3 numbers', () => expect(checkBet('street', [1,2,3], 2)).toBe(true));
  it('loses when result is outside',         () => expect(checkBet('street', [1,2,3], 4)).toBe(false));
});

describe('checkBet — sixline', () => {
  it('wins when result is in any of the 6 numbers', () => expect(checkBet('sixline', [1,2,3,4,5,6], 5)).toBe(true));
  it('loses when result is outside',                () => expect(checkBet('sixline', [1,2,3,4,5,6], 7)).toBe(false));
});

// ── PAYOUTS values ─────────────────────────────────────────────────────────────
describe('PAYOUTS', () => {
  it('straight pays 35:1', () => expect(PAYOUTS.straight).toBe(35));
  it('split pays 17:1',    () => expect(PAYOUTS.split).toBe(17));
  it('street pays 11:1',   () => expect(PAYOUTS.street).toBe(11));
  it('corner pays 8:1',    () => expect(PAYOUTS.corner).toBe(8));
  it('sixline pays 5:1',   () => expect(PAYOUTS.sixline).toBe(5));
  it('column pays 2:1',    () => expect(PAYOUTS.column).toBe(2));
  it('dozen pays 2:1',     () => expect(PAYOUTS.dozen).toBe(2));
  it('red pays 1:1',       () => expect(PAYOUTS.red).toBe(1));
});

// ── resolveAllBets ─────────────────────────────────────────────────────────────
describe('resolveAllBets', () => {
  it('straight win returns stake + 35× stake (36 total)', () => {
    const bets = [{ id: '1', type: 'straight', nums: [7], amount: 10, key: 'straight:7' }];
    const { returned } = resolveAllBets(bets, 7);
    expect(returned).toBe(10 * 36); // 360
  });

  it('straight loss returns 0', () => {
    const bets = [{ id: '1', type: 'straight', nums: [7], amount: 10, key: 'straight:7' }];
    const { returned } = resolveAllBets(bets, 8);
    expect(returned).toBe(0);
  });

  it('multiple simultaneous bets — only winners pay out', () => {
    const bets = [
      { id: '1', type: 'red',      nums: [], amount: 100, key: 'red:' },
      { id: '2', type: 'straight', nums: [7], amount: 10, key: 'straight:7' },
    ];
    // result = 7 (red) — 7 is a red number in European roulette
    const { returned, wonIds } = resolveAllBets(bets, 7);
    // red wins: 100 * 2 = 200
    // straight wins: 10 * 36 = 360
    expect(returned).toBe(200 + 360);
    expect(wonIds.has('1')).toBe(true);
    expect(wonIds.has('2')).toBe(true);
  });

  it('zero: only straight-0 pays, outside bets lose', () => {
    const bets = [
      { id: '1', type: 'straight', nums: [0], amount: 5,  key: 'straight:0' },
      { id: '2', type: 'red',      nums: [], amount: 100, key: 'red:' },
    ];
    const { returned, wonIds } = resolveAllBets(bets, 0);
    expect(returned).toBe(5 * 36);   // only straight-0 wins
    expect(wonIds.has('1')).toBe(true);
    expect(wonIds.has('2')).toBe(false);
  });

  it('wonIds is empty when no bet wins', () => {
    const bets = [{ id: '1', type: 'red', nums: [], amount: 50, key: 'red:' }];
    const { returned, wonIds } = resolveAllBets(bets, 2); // 2 is black
    expect(returned).toBe(0);
    expect(wonIds.size).toBe(0);
  });
});

// ── getHotNumbers ──────────────────────────────────────────────────────────────
describe('getHotNumbers', () => {
  it('returns most frequent numbers in order', () => {
    const history = [7, 7, 7, 3, 3, 15];
    const hot = getHotNumbers(history, 2);
    expect(hot[0].num).toBe(7);
    expect(hot[0].count).toBe(3);
    expect(hot[1].num).toBe(3);
    expect(hot[1].count).toBe(2);
  });

  it('returns at most n results', () => {
    const history = [1, 2, 3, 4, 5, 6];
    expect(getHotNumbers(history, 3)).toHaveLength(3);
  });

  it('returns empty array for empty history', () => {
    expect(getHotNumbers([], 5)).toHaveLength(0);
  });
});

// ── CHIP_DENOMS sanity ─────────────────────────────────────────────────────────
describe('CHIP_DENOMS', () => {
  it('contains [1, 5, 25, 100, 500]', () => {
    expect(CHIP_DENOMS).toEqual([1, 5, 25, 100, 500]);
  });
});
