import React from "react";
import { cards as singleDeckCards } from "../data/cardsData";
import { NUM_DECKS, RESHUFFLE_THRESHOLD } from "../logic/blackjackRules";

/**
 * Manages the multi-deck shoe used for dealing.
 *
 * Each card instance receives a unique `uid` (e.g. "AC_d2") so that the
 * same physical card appearing in multiple decks can be distinguished by
 * React's reconciler and the deck-animation logic.
 *
 * The shoe is reshuffled automatically when RESHUFFLE_THRESHOLD of cards
 * have been dealt (penetration rule).
 */
export default class Cards extends React.Component {
  /** Remaining undealt cards in the shoe */
  static cards = [];

  /** Total cards when the shoe was last built (NUM_DECKS × 52 = 312) */
  static shoeSize = 0;

  /**
   * Build a freshly shuffled NUM_DECKS-deck shoe.
   * Call this at the start of a new session or whenever needsReshuffle() is true.
   */
  static setCards() {
    const shoe = [];

    for (let d = 0; d < NUM_DECKS; d++) {
      for (const card of singleDeckCards) {
        // uid = "<cardId>_d<deckIndex>" guarantees uniqueness across all 6 decks
        shoe.push({ ...card, uid: `${card.id}_d${d}` });
      }
    }

    // Fisher-Yates shuffle for true randomness
    for (let i = shoe.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
    }

    this.cards = shoe;
    this.shoeSize = shoe.length; // 312 for a 6-deck shoe
  }

  /**
   * Return true when ≥ RESHUFFLE_THRESHOLD of the shoe has been dealt.
   * At 75% penetration on 312 cards the shoe reshuffles when < 78 remain.
   */
  static needsReshuffle() {
    return (
      this.shoeSize > 0 &&
      this.cards.length <= this.shoeSize * (1 - RESHUFFLE_THRESHOLD)
    );
  }

  /**
   * Remove and return a random card from the remaining shoe.
   * @returns {object} Card object with uid
   */
  static getRandomCard() {
    const index = Math.floor(Math.random() * this.cards.length);
    const card = this.cards[index];
    this.cards.splice(index, 1);
    return card;
  }
}
