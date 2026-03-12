import React from "react";
import { calculateScore, dealerShouldHit } from "../logic/blackjackRules";

/**
 * Static class managing the dealer's hand state.
 * Each element in `cards` is { card: CardObject, isHidden: boolean }.
 *
 * Dealing convention:
 *   cards[0] → face-up (visible upcard)
 *   cards[1] → face-down (hole card, revealed when player finishes)
 */
export default class DealerHand extends React.Component {
  /** @type {Array<{card: object, isHidden: boolean}>} */
  static cards = [];

  /**
   * Add a card to the dealer's hand.
   * @param {object}  card
   * @param {boolean} isHidden – true for the hole card dealt face-down
   */
  static addCard(card, isHidden) {
    this.cards.push({ card, isHidden });
  }

  /** Clear the dealer's hand for a new round. */
  static resetCards() {
    this.cards = [];
  }

  /**
   * Score based on face-up (visible) cards only.
   * Used during the player's turn to show the partial dealer total.
   *
   * @returns {number}
   */
  static getScore() {
    const visible = this.cards.filter(c => !c.isHidden).map(c => c.card);
    return calculateScore(visible);
  }

  /**
   * Score based on ALL cards (visible + hole card).
   * Used for blackjack peek checks and final resolution.
   *
   * @returns {number}
   */
  static getFullScore() {
    return calculateScore(this.cards.map(c => c.card));
  }

  /**
   * True when the dealer must draw another card (Vegas rules):
   *   • Any total below 17
   *   • Soft 17 (Ace counted as 11, total = 17)
   *
   * Should only be called after all dealer cards are face-up.
   *
   * @returns {boolean}
   */
  static mustHit() {
    const revealed = this.cards.filter(c => !c.isHidden).map(c => c.card);
    return dealerShouldHit(revealed);
  }
}
