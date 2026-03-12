/**
 * Unit tests for blackjackRules.js
 * Run with: npm test
 *
 * Tests cover:
 *  - Hand value calculation (hard and soft aces)
 *  - Blackjack detection
 *  - Soft 17 / dealer hit logic
 *  - Split and payout constants
 *  - Basic strategy hint correctness
 */

import { describe, it, expect } from 'vitest';
import {
  calculateScore,
  isSoftHand,
  isBlackjack,
  isDealerSoftSeventeen,
  dealerShouldHit,
  getBasicStrategyHint,
  NUM_DECKS,
  RESHUFFLE_THRESHOLD,
  BLACKJACK_PAYOUT,
  INSURANCE_PAYOUT,
  SURRENDER_RETURN,
  ACE_HIGH,
  TEN_VALUE,
  MAX_HAND_VALUE,
} from '../blackjackRules.js';

// ─── Helper to build card stubs ────────────────────────────────────────────────
const card = (value, rank = String(value)) => ({ value, rank });
const ace  = () => card(ACE_HIGH, 'A');
const ten  = () => card(TEN_VALUE, 'K');

// ─── Constants ─────────────────────────────────────────────────────────────────

describe('Constants', () => {
  it('NUM_DECKS is 6', () => expect(NUM_DECKS).toBe(6));
  it('RESHUFFLE_THRESHOLD is 0.75', () => expect(RESHUFFLE_THRESHOLD).toBe(0.75));
  it('BLACKJACK_PAYOUT is 1.5 (3:2)', () => expect(BLACKJACK_PAYOUT).toBe(1.5));
  it('INSURANCE_PAYOUT is 2 (2:1)', () => expect(INSURANCE_PAYOUT).toBe(2));
  it('SURRENDER_RETURN is 0.5 (50%)', () => expect(SURRENDER_RETURN).toBe(0.5));
  it('MAX_HAND_VALUE is 21', () => expect(MAX_HAND_VALUE).toBe(21));
});

// ─── calculateScore ────────────────────────────────────────────────────────────

describe('calculateScore', () => {
  it('sums a simple hand with no aces', () => {
    expect(calculateScore([card(7), card(8)])).toBe(15);
  });

  it('face cards count as 10', () => {
    expect(calculateScore([ten(), ten()])).toBe(20);
  });

  it('Ace counts as 11 when it does not bust', () => {
    expect(calculateScore([ace(), card(6)])).toBe(17); // soft 17
  });

  it('Ace counts as 1 when 11 would bust', () => {
    expect(calculateScore([ace(), card(9), card(5)])).toBe(15); // A=1, 9+5=14+1=15
  });

  it('two aces: one counts as 11, one as 1 (total 12)', () => {
    expect(calculateScore([ace(), ace()])).toBe(12);
  });

  it('three aces: reduces until no bust', () => {
    // A(11) + A(11) + A(11) = 33 → 23 → 13
    expect(calculateScore([ace(), ace(), ace()])).toBe(13);
  });

  it('classic Blackjack hand scores 21', () => {
    expect(calculateScore([ace(), ten()])).toBe(21);
  });

  it('hard 17 (no aces)', () => {
    expect(calculateScore([card(9), card(8)])).toBe(17);
  });

  it('bust hand returns value > 21', () => {
    expect(calculateScore([card(10), card(10), card(5)])).toBe(25);
  });

  it('empty hand scores 0', () => {
    expect(calculateScore([])).toBe(0);
  });
});

// ─── isSoftHand ────────────────────────────────────────────────────────────────

describe('isSoftHand', () => {
  it('A + 6 = soft 17', () => {
    expect(isSoftHand([ace(), card(6)])).toBe(true);
  });

  it('A + 10 = soft 21 (Blackjack) → still soft', () => {
    expect(isSoftHand([ace(), ten()])).toBe(true);
  });

  it('A + 9 + 5 = 15 hard (ace forced to 1)', () => {
    expect(isSoftHand([ace(), card(9), card(5)])).toBe(false);
  });

  it('K + 7 = 17 hard', () => {
    expect(isSoftHand([ten(), card(7)])).toBe(false);
  });

  it('two aces = 12 soft', () => {
    expect(isSoftHand([ace(), ace()])).toBe(true);
  });
});

// ─── isBlackjack ──────────────────────────────────────────────────────────────

describe('isBlackjack', () => {
  it('Ace + King = Blackjack', () => {
    expect(isBlackjack([ace(), ten()])).toBe(true);
  });

  it('three cards totalling 21 is NOT Blackjack', () => {
    expect(isBlackjack([card(7), card(7), card(7)])).toBe(false);
  });

  it('two cards not totalling 21 is NOT Blackjack', () => {
    expect(isBlackjack([card(9), card(9)])).toBe(false);
  });

  it('A + A = 12 is NOT Blackjack', () => {
    expect(isBlackjack([ace(), ace()])).toBe(false);
  });
});

// ─── Dealer soft 17 ────────────────────────────────────────────────────────────

describe('isDealerSoftSeventeen', () => {
  it('A + 6 = soft 17 → true', () => {
    expect(isDealerSoftSeventeen([ace(), card(6)])).toBe(true);
  });

  it('7 + 10 = hard 17 → false', () => {
    expect(isDealerSoftSeventeen([card(7), ten()])).toBe(false);
  });

  it('A + 7 = soft 18 → false', () => {
    expect(isDealerSoftSeventeen([ace(), card(7)])).toBe(false);
  });

  it('A + 2 + 4 = soft 17 → true', () => {
    expect(isDealerSoftSeventeen([ace(), card(2), card(4)])).toBe(true);
  });
});

describe('dealerShouldHit', () => {
  it('hard 16 → must hit', () => {
    expect(dealerShouldHit([card(9), card(7)])).toBe(true);
  });

  it('hard 17 → must NOT hit', () => {
    expect(dealerShouldHit([card(10), card(7)])).toBe(false);
  });

  it('soft 17 (A+6) → must hit (Vegas rules)', () => {
    expect(dealerShouldHit([ace(), card(6)])).toBe(true);
  });

  it('soft 18 (A+7) → must NOT hit', () => {
    expect(dealerShouldHit([ace(), card(7)])).toBe(false);
  });

  it('hard 18 → must NOT hit', () => {
    expect(dealerShouldHit([card(10), card(8)])).toBe(false);
  });

  it('dealer bust (22) → must NOT draw more', () => {
    expect(dealerShouldHit([card(10), card(10), card(2)])).toBe(false);
  });
});

// ─── Basic strategy hints ──────────────────────────────────────────────────────

describe('getBasicStrategyHint', () => {
  const opts = { canDouble: true, canSplit: true, canSurrender: true };
  const noOpts = {};

  // Hard totals
  it('hard 8 vs any → HIT', () => {
    expect(getBasicStrategyHint([card(3), card(5)], card(6), opts)).toBe('HIT');
  });

  it('hard 11 → DOUBLE when available', () => {
    expect(getBasicStrategyHint([card(6), card(5)], card(8), opts)).toBe('DOUBLE');
  });

  it('hard 11 → HIT when double not available', () => {
    expect(getBasicStrategyHint([card(6), card(5)], card(8), noOpts)).toBe('HIT');
  });

  it('hard 16 vs dealer 10 → SURRENDER', () => {
    expect(getBasicStrategyHint([card(9), card(7)], ten(), opts)).toBe('SURRENDER');
  });

  it('hard 15 vs dealer 10 → SURRENDER', () => {
    expect(getBasicStrategyHint([card(8), card(7)], ten(), opts)).toBe('SURRENDER');
  });

  it('hard 13 vs dealer 5 → STAND', () => {
    expect(getBasicStrategyHint([card(8), card(5)], card(5), opts)).toBe('STAND');
  });

  it('hard 13 vs dealer 7 → HIT', () => {
    expect(getBasicStrategyHint([card(8), card(5)], card(7), opts)).toBe('HIT');
  });

  it('hard 17 → STAND', () => {
    expect(getBasicStrategyHint([card(10), card(7)], card(6), opts)).toBe('STAND');
  });

  // Soft totals
  it('soft 17 (A+6) vs dealer 3-6 → DOUBLE', () => {
    expect(getBasicStrategyHint([ace(), card(6)], card(4), opts)).toBe('DOUBLE');
  });

  it('soft 18 (A+7) vs dealer 9 → HIT', () => {
    expect(getBasicStrategyHint([ace(), card(7)], card(9), opts)).toBe('HIT');
  });

  it('soft 18 (A+7) vs dealer 7 → STAND', () => {
    expect(getBasicStrategyHint([ace(), card(7)], card(7), opts)).toBe('STAND');
  });

  it('soft 19 (A+8) → STAND', () => {
    expect(getBasicStrategyHint([ace(), card(8)], card(6), opts)).toBe('STAND');
  });

  // Pairs
  it('pair of Aces → SPLIT', () => {
    expect(getBasicStrategyHint([ace(), ace()], card(6), opts)).toBe('SPLIT');
  });

  it('pair of 8s → SPLIT', () => {
    expect(getBasicStrategyHint([card(8), card(8)], card(9), opts)).toBe('SPLIT');
  });

  it('pair of 10s → STAND', () => {
    expect(getBasicStrategyHint([ten(), ten()], card(6), opts)).toBe('STAND');
  });

  it('pair of 9s vs dealer 7 → STAND', () => {
    expect(getBasicStrategyHint([card(9), card(9)], card(7), opts)).toBe('STAND');
  });

  it('pair of 9s vs dealer 6 → SPLIT', () => {
    expect(getBasicStrategyHint([card(9), card(9)], card(6), opts)).toBe('SPLIT');
  });
});
