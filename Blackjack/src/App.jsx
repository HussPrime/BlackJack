import { useEffect, useRef, useState } from "react";

import Game from "./components/Game";
import DealerHand from "./components/DealerHand";
import PlayerHand from "./components/PlayerHand";
import Cards from "./components/Cards";
import HUD from "./components/HUD";
import HUD3D from "./components/HUD3D";

import {
  isBlackjack,
  calculateScore,
  ACE_HIGH,
  TEN_VALUE,
  MAX_HAND_VALUE,
  BLACKJACK_PAYOUT,
  SURRENDER_RETURN,
  getBasicStrategyHint,
} from "./logic/blackjackRules";
import { loadStats, recordHand } from "./logic/statsManager";

/**
 * Maximum cards shown in the 3D deck-pile visual.
 * Capped at 52 so we never render hundreds of meshes for a 6-deck shoe.
 */
const VISUAL_DECK_SIZE = 52;

const BlackJack = ({ onBack }) => {
  // ─── Core game state ───────────────────────────────────────────────────────
  const [playerCards, setPlayerCards] = useState(PlayerHand.cards);
  const [dealerCards, setDealerCards] = useState(DealerHand.cards);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [monney, setMonney] = useState(1000);
  const [bet, setBet] = useState(0);
  const [hasBet, setHasBet] = useState(false);
  const [message, setMessage] = useState("");
  const [stand, setStand] = useState(false);
  const [restart, setRestart] = useState(false);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [deck, setDeck] = useState([]);
  const [prevDeck, setPrevDeck] = useState([]);
  const [hasWin, setHasWin] = useState(-1);

  // ─── New casino features ───────────────────────────────────────────────────

  /**
   * True until the player takes any action (hit, double, split, surrender).
   * Gates Double Down, Surrender, and Split availability.
   */
  const [firstTurn, setFirstTurn] = useState(false);

  // Insurance (offered when dealer up-card is an Ace, Vegas peek rules)
  const [insuranceOffered, setInsuranceOffered] = useState(false);
  const insuranceBetRef = useRef(0); // use ref to avoid stale closure in resolveInsurance

  // Split support
  const [isSplit, setIsSplit] = useState(false);
  const [splitHands, setSplitHands] = useState([]); // [{cards, bet}]
  const [activeHandIndex, setActiveHandIndex] = useState(0);
  const [isSplitAce, setIsSplitAce] = useState(false);

  // Refs kept in sync with matching state – used inside async callbacks
  const isSplitRef = useRef(false);
  const splitHandsRef = useRef([]);
  const activeHandIndexRef = useRef(0);
  const isSplitAceRef = useRef(false);
  const betRef = useRef(0);
  const deckRef = useRef([]);
  const statsRef = useRef(null);

  // Stats
  const [stats, setStats] = useState(() => loadStats());
  const [showStats, setShowStats] = useState(false);

  // Basic-strategy hint
  const [hint, setHint] = useState(null);

  const cameraRef = useRef();

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  // ─── Keep refs in sync ─────────────────────────────────────────────────────
  useEffect(() => { isSplitRef.current = isSplit; }, [isSplit]);
  useEffect(() => { splitHandsRef.current = splitHands; }, [splitHands]);
  useEffect(() => { activeHandIndexRef.current = activeHandIndex; }, [activeHandIndex]);
  useEffect(() => { isSplitAceRef.current = isSplitAce; }, [isSplitAce]);
  useEffect(() => { betRef.current = bet; }, [bet]);
  useEffect(() => { deckRef.current = deck; }, [deck]);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  // ─── Derived availability flags ────────────────────────────────────────────
  const canDouble   = firstTurn && hasBet && !stand && !isGameFinished && !isSplitAce;
  const canSurrender = firstTurn && hasBet && !stand && !isGameFinished && !isSplit;
  const canSplit = (
    firstTurn && hasBet && !stand && !isGameFinished && !isSplit &&
    PlayerHand.cards.length === 2 &&
    PlayerHand.cards[0]?.value === PlayerHand.cards[1]?.value
  );

  // ─── Helper: update visual deck state ─────────────────────────────────────
  const updateDeckVisual = () => {
    const newVisual = [...Cards.cards].slice(0, VISUAL_DECK_SIZE);
    setPrevDeck(deckRef.current);
    setDeck(newVisual);
    deckRef.current = newVisual;
  };

  // ─── Restart / new round ───────────────────────────────────────────────────
  useEffect(() => {
    setHasWin(-1);
    setHasBet(false);
    setHint(null);
    setFirstTurn(false);
    setInsuranceOffered(false);
    insuranceBetRef.current = 0;
    setIsSplit(false);
    setSplitHands([]);
    setActiveHandIndex(0);
    setIsSplitAce(false);
    isSplitRef.current = false;
    splitHandsRef.current = [];
    activeHandIndexRef.current = 0;
    isSplitAceRef.current = false;

    if (bet > monney) setBet(monney);
    setRestart(false);
    setStand(false);
    setIsGameFinished(false);

    // Reshuffle the shoe if needed (75% dealt = penetration rule)
    if (Cards.cards.length === 0 || Cards.needsReshuffle()) {
      Cards.setCards();
      setMessage("Shoe reshuffled");
    }

    updateDeckVisual();

    if (monney === 0) {
      setMonney(100);
      setMessage("Someone gave you 100 chips!");
    }
  }, [restart]);

  // ─── Game start (after bet is placed) ─────────────────────────────────────
  useEffect(() => {
    if (!hasBet) return;

    Game.initGame();

    setPlayerCards([...PlayerHand.cards]);
    setDealerCards([...DealerHand.cards]);
    setPlayerScore(PlayerHand.getScore());
    setDealerScore(DealerHand.getScore());

    // Vegas peek: offer insurance when dealer's up-card is an Ace
    const dealerUpCard = DealerHand.cards[0].card;
    if (dealerUpCard.value === ACE_HIGH) {
      setInsuranceOffered(true);
      setMessage("Insurance?");
    } else {
      startPlayerTurn();
    }
  }, [hasBet]);

  /**
   * Transition to the player's turn.
   * If the player already has Blackjack, go straight to the dealer's turn.
   */
  const startPlayerTurn = () => {
    setInsuranceOffered(false);
    setFirstTurn(true);

    if (isBlackjack(PlayerHand.cards)) {
      setMessage("Dealer's turn");
      setStand(true);
      setFirstTurn(false);
      setTimeout(() => onStand(), 50);
    } else {
      setMessage("Your turn");
    }
  };

  // ─── Insurance ─────────────────────────────────────────────────────────────

  /**
   * Player takes insurance for 50% of their bet.
   * Peek at dealer hole card immediately (Vegas rules).
   */
  const onTakeInsurance = () => {
    const ibet = Math.floor(betRef.current / 2);
    insuranceBetRef.current = ibet;
    setMonney(m => m - ibet);
    setInsuranceOffered(false);
    resolveInsurance(true, ibet);
  };

  /** Player declines insurance – game continues normally. */
  const onDeclineInsurance = () => {
    insuranceBetRef.current = 0;
    setInsuranceOffered(false);
    resolveInsurance(false, 0);
  };

  /**
   * Peek at the dealer hole card and react accordingly.
   * @param {boolean} took   - Did the player take insurance?
   * @param {number}  ibet   - Insurance stake amount
   */
  const resolveInsurance = async (took, ibet) => {
    // Hole card is the second dealer card (index 1)
    const holeCard = DealerHand.cards[1].card;
    const dealerHasBJ = holeCard.value === TEN_VALUE; // Ace upcard + 10-value hole = BJ

    if (dealerHasBJ) {
      // Reveal dealer hand immediately
      DealerHand.cards.forEach(c => { c.isHidden = false; });
      setDealerCards([...DealerHand.cards]);
      setDealerScore(DealerHand.getFullScore());

      if (took) {
        // Insurance pays 2:1 — return stake + 2× stake = 3× stake
        setMonney(m => m + 3 * ibet);
      }

      const playerHasBJ = isBlackjack(PlayerHand.cards);
      if (playerHasBJ) {
        // Both have Blackjack → push on main hand
        setHasWin(2);
        setMessage("Push – Both Blackjack!");
        setMonney(m => m + betRef.current);
        const ns = recordHand(statsRef.current, 'push', false, 0);
        setStats(ns);
      } else {
        setHasWin(0);
        setMessage("Dealer Blackjack");
        const ns = recordHand(statsRef.current, 'loss', false, -betRef.current);
        setStats(ns);
      }

      setIsGameFinished(true);
      setStand(true);
      return;
    }

    // No dealer Blackjack — insurance lost (stake already deducted)
    if (took) {
      setMessage("No dealer BJ – insurance lost");
      await sleep(900);
    }

    startPlayerTurn();
  };

  // ─── Player actions ────────────────────────────────────────────────────────

  /** Draw one card. */
  const onHit = () => {
    setFirstTurn(false);
    setHint(null);

    PlayerHand.addCard(Cards.getRandomCard());
    const newScore = PlayerHand.getScore();

    setPlayerCards([...PlayerHand.cards]);
    setPlayerScore(newScore);
    updateDeckVisual();

    if (newScore > 21) {
      handlePlayerBust();
    } else if (newScore === MAX_HAND_VALUE) {
      // Reached 21 — auto-stand
      setMessage("Dealer's turn");
      setStand(true);
      setTimeout(() => onStand(), 50);
    }
  };

  /** Handle a player bust, respecting split mode. */
  const handlePlayerBust = () => {
    const isInSplit = isSplitRef.current;
    const currentIndex = activeHandIndexRef.current;
    const hands = splitHandsRef.current;

    if (isInSplit && currentIndex < hands.length - 1) {
      // Busted on a split hand that isn't the last — move to next hand
      const updatedHands = hands.map((h, i) =>
        i === currentIndex ? { ...h, busted: true } : h
      );
      setSplitHands(updatedHands);
      splitHandsRef.current = updatedHands;
      setMessage(`Hand ${currentIndex + 1} busted!`);
      setTimeout(() => switchToNextSplitHand(updatedHands, currentIndex + 1), 600);
    } else if (isInSplit) {
      // Last split hand busted — proceed to dealer
      const updatedHands = hands.map((h, i) =>
        i === currentIndex ? { ...h, busted: true } : h
      );
      setSplitHands(updatedHands);
      splitHandsRef.current = updatedHands;
      setMessage(`Hand ${currentIndex + 1} busted!`);
      setStand(true);
      setTimeout(() => onStand(), 600);
    } else {
      // Single hand bust — immediate loss
      setMessage("You busted!");
      setIsGameFinished(true);
      setStand(true);
      const ns = recordHand(statsRef.current, 'loss', true, -betRef.current);
      setStats(ns);
    }
  };

  /**
   * Double Down: double the wager, draw exactly one card, then auto-stand.
   * Only available on the first two cards.
   */
  const onDoubleDown = () => {
    setFirstTurn(false);
    setHint(null);

    const originalBet = betRef.current;
    const newBet = originalBet * 2;

    // Deduct the additional stake before updating `bet` state
    setMonney(m => m - originalBet);
    setBet(newBet);
    betRef.current = newBet;

    PlayerHand.addCard(Cards.getRandomCard());
    const newScore = PlayerHand.getScore();

    setPlayerCards([...PlayerHand.cards]);
    setPlayerScore(newScore);
    updateDeckVisual();

    if (newScore > 21) {
      // Bust after doubling
      handlePlayerBust();
    } else {
      setMessage("Doubled – Dealer's turn");
      setStand(true);
      setTimeout(() => onStand(), 50);
    }
  };

  /**
   * Late Surrender: forfeit the hand and recover 50% of the bet.
   * Only available before any other player action on the first two cards.
   */
  const onSurrender = () => {
    setFirstTurn(false);
    setHint(null);
    setMessage("Surrendered");

    // Return half the bet (the other half was already paid on hasBet)
    setMonney(m => m + betRef.current * SURRENDER_RETURN);
    setHasWin(0);
    setIsGameFinished(true);
    setStand(true);

    const ns = recordHand(
      statsRef.current,
      'loss',
      false,
      -(betRef.current * SURRENDER_RETURN)
    );
    setStats(ns);
  };

  /**
   * Split: divide a pair into two hands, each receiving one new card.
   * Each hand is played sequentially. Split Aces receive one card and auto-stand.
   */
  const onSplit = () => {
    setFirstTurn(false);
    setHint(null);

    const [card1, card2] = PlayerHand.cards;
    const acesSplit = card1.value === ACE_HIGH;

    // Deduct a second bet for the new hand
    setMonney(m => m - betRef.current);

    const newCard1 = Cards.getRandomCard();
    const newCard2 = Cards.getRandomCard();

    const hand0 = { cards: [card1, newCard1], bet: betRef.current, busted: false };
    const hand1 = { cards: [card2, newCard2], bet: betRef.current, busted: false };
    const hands = [hand0, hand1];

    setSplitHands(hands);
    splitHandsRef.current = hands;
    setIsSplit(true);
    isSplitRef.current = true;
    setIsSplitAce(acesSplit);
    isSplitAceRef.current = acesSplit;
    setActiveHandIndex(0);
    activeHandIndexRef.current = 0;

    // Load hand 0 into PlayerHand
    PlayerHand.resetCards();
    hand0.cards.forEach(c => PlayerHand.addCard(c));

    const score0 = calculateScore(hand0.cards);
    setPlayerCards([...hand0.cards]);
    setPlayerScore(score0);
    updateDeckVisual();

    if (acesSplit) {
      // Split Aces: player gets one card each, no further actions
      setMessage("Split Aces – auto-stand");
      setStand(true);
      setTimeout(() => onStand(), 50);
    } else {
      setMessage("Playing Hand 1 of 2");
      setFirstTurn(true); // Allow double on first two cards of new split hand
    }
  };

  /**
   * Load the next split hand into PlayerHand and update UI.
   * @param {Array} hands        - Latest splitHands array
   * @param {number} nextIndex   - Index of the hand to activate
   */
  const switchToNextSplitHand = (hands, nextIndex) => {
    const nextHand = hands[nextIndex];

    PlayerHand.resetCards();
    nextHand.cards.forEach(c => PlayerHand.addCard(c));

    const nextScore = PlayerHand.getScore();
    setPlayerCards([...nextHand.cards]);
    setPlayerScore(nextScore);
    setActiveHandIndex(nextIndex);
    activeHandIndexRef.current = nextIndex;
    setStand(false);
    setFirstTurn(true);
    setMessage(`Playing Hand ${nextIndex + 1} of 2`);
  };

  // ─── Stand / Dealer's turn ─────────────────────────────────────────────────
  const onStand = async () => {
    setStand(true);
    setFirstTurn(false);
    setHint(null);

    // If we're on a split hand (not the last), move to the next one
    if (isSplitRef.current && !isSplitAceRef.current &&
        activeHandIndexRef.current < splitHandsRef.current.length - 1) {
      const idx = activeHandIndexRef.current;
      const hands = splitHandsRef.current.map((h, i) =>
        i === idx ? { ...h, stood: true } : h
      );
      setSplitHands(hands);
      splitHandsRef.current = hands;
      await sleep(400);
      switchToNextSplitHand(hands, idx + 1);
      return;
    }

    await sleep(700);
    setMessage("Dealer's turn");

    // Reveal all dealer cards
    DealerHand.cards.forEach(c => { c.isHidden = false; });
    setDealerCards([...DealerHand.cards]);
    setDealerScore(DealerHand.getScore());

    // Dealer draws according to Vegas rules: hit on < 17 and on soft 17
    while (DealerHand.mustHit()) {
      await sleep(1350);
      DealerHand.addCard(Cards.getRandomCard(), false);
      setDealerCards([...DealerHand.cards]);
      setDealerScore(DealerHand.getScore());
      updateDeckVisual();
    }

    const finalDealerScore = DealerHand.getFullScore();

    if (isSplitRef.current) {
      await resolveSplitHands(finalDealerScore);
    } else {
      await resolveSingleHand(PlayerHand.getScore(), finalDealerScore);
    }

    setIsGameFinished(true);
  };

  /**
   * Determine the winner for a single (non-split) hand.
   * @param {number} playerScore
   * @param {number} dealerScore
   */
  const resolveSingleHand = async (playerScore, dealerScore) => {
    const isPlayerBJ = isBlackjack(PlayerHand.cards);
    let outcome, netChange;

    if (playerScore > 21) {
      // Already busted (handled inline in onHit) – shouldn't reach here normally
      setHasWin(0);
      setMessage("You busted!");
      outcome = 'loss';
      netChange = -betRef.current;
    } else if (isPlayerBJ) {
      // Natural Blackjack pays 3:2
      setHasWin(1);
      setMessage("Blackjack! 🎉");
      setMonney(m => m + betRef.current + betRef.current * BLACKJACK_PAYOUT);
      outcome = 'blackjack';
      netChange = betRef.current * BLACKJACK_PAYOUT;
    } else if (dealerScore > 21 || playerScore > dealerScore) {
      setHasWin(1);
      setMessage("You won!");
      setMonney(m => m + 2 * betRef.current);
      outcome = 'win';
      netChange = betRef.current;
    } else if (playerScore < dealerScore) {
      setHasWin(0);
      setMessage("You lost");
      outcome = 'loss';
      netChange = -betRef.current;
    } else {
      // Push — return bet
      setHasWin(2);
      setMessage("Push");
      setMonney(m => m + betRef.current);
      outcome = 'push';
      netChange = 0;
    }

    await sleep(300);
    const ns = recordHand(statsRef.current, outcome, playerScore > 21, netChange);
    setStats(ns);
  };

  /**
   * Resolve each split hand independently against the dealer's final score.
   * @param {number} dealerScore
   */
  const resolveSplitHands = async (dealerScore) => {
    const hands = splitHandsRef.current;
    let totalNet = 0;
    let wins = 0, losses = 0, pushCount = 0;
    let firstOutcome = 'loss';

    for (const hand of hands) {
      const hScore = calculateScore(hand.cards);
      const hBet = hand.bet;
      let outcome, netChange;

      if (hand.busted || hScore > 21) {
        outcome = 'loss';
        netChange = -hBet;
        losses++;
      } else if (
        !isSplitAceRef.current &&
        isBlackjack(hand.cards)
      ) {
        // Split Blackjack (not split aces) typically pays 1:1 at most casinos,
        // but we'll pay 3:2 since it's a genuine natural 21.
        outcome = 'blackjack';
        netChange = hBet * BLACKJACK_PAYOUT;
        setMonney(m => m + hBet + hBet * BLACKJACK_PAYOUT);
        wins++;
      } else if (dealerScore > 21 || hScore > dealerScore) {
        outcome = 'win';
        netChange = hBet;
        setMonney(m => m + 2 * hBet);
        wins++;
      } else if (hScore < dealerScore) {
        outcome = 'loss';
        netChange = -hBet;
        losses++;
      } else {
        outcome = 'push';
        netChange = 0;
        setMonney(m => m + hBet);
        pushCount++;
      }

      totalNet += netChange;
      if (firstOutcome === 'loss') firstOutcome = outcome;

      const ns = recordHand(statsRef.current, outcome, hand.busted || hScore > 21, netChange);
      statsRef.current = ns;
      setStats(ns);
    }

    // Overall display
    if (wins > losses) {
      setHasWin(1);
      setMessage(`Won ${wins} / ${hands.length} hands`);
    } else if (losses > wins) {
      setHasWin(0);
      setMessage(`Lost ${losses} / ${hands.length} hands`);
    } else {
      setHasWin(2);
      setMessage("Split – Even");
    }
  };

  const onRetry = () => {
    setRestart(true);
  };

  /** Show the basic-strategy hint for the current hand. */
  const onHint = () => {
    const dealerUpCard = DealerHand.cards[0]?.card;
    if (!dealerUpCard) return;

    const h = getBasicStrategyHint(
      PlayerHand.cards,
      dealerUpCard,
      { canDouble, canSplit, canSurrender }
    );
    setHint(h);
  };

  return (
    <>
      {onBack && (
        <button className="lobby-back-btn" onClick={onBack}>← LOBBY</button>
      )}
      <HUD3D
        dealerCards={dealerCards}
        playerCards={playerCards}
        dealerScore={dealerScore}
        playerScore={playerScore}
        deck={deck}
        prevDeck={prevDeck}
        monney={monney}
        bet={bet}
        hasBet={hasBet}
        isGameFinished={isGameFinished}
        hasWin={hasWin}
        message={message}
        cameraRef={cameraRef}
      />

      <HUD
        monney={monney}
        bet={bet}
        onHit={onHit}
        onStand={onStand}
        onRetry={onRetry}
        onDoubleDown={onDoubleDown}
        onSurrender={onSurrender}
        onSplit={onSplit}
        onTakeInsurance={onTakeInsurance}
        onDeclineInsurance={onDeclineInsurance}
        onHint={onHint}
        isStand={stand}
        isGameFinished={isGameFinished}
        hasBet={hasBet}
        canDouble={canDouble}
        canSurrender={canSurrender}
        canSplit={canSplit}
        insuranceOffered={insuranceOffered}
        hint={hint}
        stats={stats}
        showStats={showStats}
        onToggleStats={() => setShowStats(s => !s)}
        onResetCamera={() => cameraRef.current?.resetCamera()}
        isSplit={isSplit}
        activeHandIndex={activeHandIndex}
        splitHands={splitHands}
      />

      {!hasBet && (
        <div className="hud-bet">
          <span className="bet-label">Bet</span>
          <input
            type="range"
            min="0"
            max={monney}
            value={bet}
            onChange={e => setBet(Number(e.target.value))}
            step="100"
            className="bet-slider"
          />
          <span className="bet-value">{bet}</span>
          <br />
          <button
            className={bet > 0 ? "hud-btn bet" : "hud-btn-disable"}
            disabled={bet === 0}
            onClick={() => {
              if (bet > 0) {
                setHasBet(true);
                setMonney(m => m - bet);
              }
            }}
          >
            BET
          </button>
        </div>
      )}
    </>
  );
};

export default BlackJack;
