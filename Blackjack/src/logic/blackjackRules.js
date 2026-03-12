/**
 * Pure game logic for casino Blackjack (Vegas rules: dealer hits soft 17, 3:2 BJ payout).
 * All functions are side-effect free and fully unit-testable.
 *
 * Rules implemented:
 *  - 6-deck shoe, reshuffled at 75% penetration
 *  - Dealer hits on soft 17 (Ace + 6 = soft 17)
 *  - Blackjack pays 3:2 (net profit of 1.5× the bet)
 *  - Insurance offered on dealer Ace, pays 2:1
 *  - Late surrender returns 50% of bet
 *  - Double Down on first two cards only
 *  - Split on pairs; Aces receive one card each and cannot be re-split
 */

// ─── Game constants ────────────────────────────────────────────────────────────

/** Number of standard 52-card decks in the shoe */
export const NUM_DECKS = 6;

/**
 * Reshuffle the shoe when this fraction of cards has been dealt.
 * At 0.75 penetration a 312-card shoe reshuffles when < 78 cards remain.
 */
export const RESHUFFLE_THRESHOLD = 0.75;

/** Blackjack net-profit multiplier. 3:2 means the player wins 1.5× their bet. */
export const BLACKJACK_PAYOUT = 1.5;

/** Insurance pays 2:1 on the insurance stake. */
export const INSURANCE_PAYOUT = 2;

/** Insurance stake is 50% of the original bet. */
export const INSURANCE_COST_RATIO = 0.5;

/** Surrender returns this fraction of the original bet. */
export const SURRENDER_RETURN = 0.5;

/** Dealer must stand at or above this hard total. */
export const DEALER_STAND_HARD = 17;

/** Maximum hand value before busting. */
export const MAX_HAND_VALUE = 21;

/** Ace counted as high (11). */
export const ACE_HIGH = 11;

/** Value of face cards and tens. */
export const TEN_VALUE = 10;

// ─── Score calculation ─────────────────────────────────────────────────────────

/**
 * Return the best (highest non-busting) score for a hand of cards.
 * Aces start at 11 and are reduced to 1 one-at-a-time whenever the score busts.
 *
 * @param {Array<{value: number}>} cards
 * @returns {number}
 */
export function calculateScore(cards) {
  let score = 0;
  let softAces = 0; // aces currently counted as 11

  for (const card of cards) {
    if (card.value === ACE_HIGH) {
      softAces++;
      score += ACE_HIGH;
    } else {
      score += card.value;
    }
  }

  // Reduce soft aces from 11 → 1 until the score no longer busts
  while (score > MAX_HAND_VALUE && softAces > 0) {
    score -= 10; // ACE_HIGH − ACE_LOW = 10
    softAces--;
  }

  return score;
}

/**
 * Return true when the hand is "soft" – at least one Ace is counted as 11.
 *
 * @param {Array<{value: number}>} cards
 * @returns {boolean}
 */
export function isSoftHand(cards) {
  let score = 0;
  let softAces = 0;

  for (const card of cards) {
    if (card.value === ACE_HIGH) {
      softAces++;
      score += ACE_HIGH;
    } else {
      score += card.value;
    }
  }

  while (score > MAX_HAND_VALUE && softAces > 0) {
    score -= 10;
    softAces--;
  }

  return softAces > 0; // a remaining soft ace means the hand is soft
}

/**
 * Detect a natural Blackjack: exactly 2 cards totalling 21.
 *
 * @param {Array<{value: number}>} cards
 * @returns {boolean}
 */
export function isBlackjack(cards) {
  return cards.length === 2 && calculateScore(cards) === MAX_HAND_VALUE;
}

// ─── Dealer drawing rules ──────────────────────────────────────────────────────

/**
 * Return true if the given cards form a soft 17 (Ace counted as 11, total = 17).
 * Vegas rules require the dealer to hit on soft 17.
 *
 * @param {Array<{value: number}>} cards – all revealed dealer cards
 * @returns {boolean}
 */
export function isDealerSoftSeventeen(cards) {
  return calculateScore(cards) === DEALER_STAND_HARD && isSoftHand(cards);
}

/**
 * Return true when the dealer must draw another card (Vegas rules):
 *  • Any total below 17
 *  • Exactly soft 17 (A + 6)
 *
 * @param {Array<{value: number}>} revealedCards – face-up dealer cards
 * @returns {boolean}
 */
export function dealerShouldHit(revealedCards) {
  const score = calculateScore(revealedCards);
  return score < DEALER_STAND_HARD || isDealerSoftSeventeen(revealedCards);
}

// ─── Basic strategy hint ───────────────────────────────────────────────────────

/**
 * Return the statistically optimal play for the current hand using standard
 * basic strategy for a 6-deck, dealer-hits-soft-17 game.
 *
 * @param {Array<{value: number}>} playerCards
 * @param {{value: number}} dealerUpCard – the dealer's visible (up) card
 * @param {{canDouble?: boolean, canSplit?: boolean, canSurrender?: boolean}} options
 * @returns {'HIT'|'STAND'|'DOUBLE'|'SPLIT'|'SURRENDER'}
 */
export function getBasicStrategyHint(
  playerCards,
  dealerUpCard,
  { canDouble = false, canSplit = false, canSurrender = false } = {}
) {
  const score = calculateScore(playerCards);
  const soft = isSoftHand(playerCards);
  const d = dealerUpCard.value; // Ace = 11, face cards = 10

  // ── Pairs ──────────────────────────────────────────────────────────────────
  if (canSplit && playerCards.length === 2) {
    const v0 = playerCards[0].value;
    const v1 = playerCards[1].value;
    if (v0 === v1) {
      if (v0 === ACE_HIGH) return 'SPLIT';   // Always split Aces
      if (v0 === 8) return 'SPLIT';          // Always split 8s
      if (v0 === TEN_VALUE) return 'STAND';  // Never split 10-value cards
      if (v0 === 9) {
        return [2, 3, 4, 5, 6, 8, 9].includes(d) ? 'SPLIT' : 'STAND';
      }
      if (v0 === 7) return d <= 7 ? 'SPLIT' : 'HIT';
      if (v0 === 6) return d <= 6 ? 'SPLIT' : 'HIT';
      if (v0 === 4) return (d === 5 || d === 6) ? 'SPLIT' : 'HIT';
      // 5-5 treated as hard 10 – fall through
      if (v0 === 3 || v0 === 2) return d <= 7 ? 'SPLIT' : 'HIT';
    }
  }

  // ── Late surrender ──────────────────────────────────────────────────────────
  if (canSurrender) {
    if (score === 16 && (d === 9 || d === TEN_VALUE || d === ACE_HIGH)) return 'SURRENDER';
    if (score === 15 && d === TEN_VALUE) return 'SURRENDER';
  }

  // ── Soft totals (at least one Ace counted as 11) ───────────────────────────
  if (soft) {
    if (score >= 19) return 'STAND';
    if (score === 18) {
      if (canDouble && d >= 2 && d <= 6) return 'DOUBLE';
      return d <= 8 ? 'STAND' : 'HIT';
    }
    if (score === 17) {
      if (canDouble && d >= 3 && d <= 6) return 'DOUBLE';
      return 'HIT';
    }
    if (score === 15 || score === 16) {
      if (canDouble && d >= 4 && d <= 6) return 'DOUBLE';
      return 'HIT';
    }
    if (score === 13 || score === 14) {
      if (canDouble && d >= 5 && d <= 6) return 'DOUBLE';
      return 'HIT';
    }
    return 'HIT';
  }

  // ── Hard totals ────────────────────────────────────────────────────────────
  if (score >= 17) return 'STAND';
  if (score >= 13) return d <= 6 ? 'STAND' : 'HIT'; // 13–16
  if (score === 12) return (d >= 4 && d <= 6) ? 'STAND' : 'HIT';
  if (score === 11) return canDouble ? 'DOUBLE' : 'HIT';
  if (score === TEN_VALUE) {
    if (canDouble && d >= 2 && d <= 9) return 'DOUBLE';
    return 'HIT';
  }
  if (score === 9) {
    if (canDouble && d >= 3 && d <= 6) return 'DOUBLE';
    return 'HIT';
  }
  return 'HIT'; // hard 8 and below
}
