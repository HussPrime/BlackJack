import { useState } from "react";
import PlayerHand from "./PlayerHand";
import StatsPanel from "./StatsPanel";

/**
 * 2D overlay HUD component.
 * Renders action buttons, insurance prompt, split indicator,
 * basic-strategy hint, and the collapsible stats panel.
 */
export default function HUD({
  monney,
  bet,
  onHit,
  onStand,
  onRetry,
  onDoubleDown,
  onSurrender,
  onSplit,
  onTakeInsurance,
  onDeclineInsurance,
  onHint,
  isStand,
  isGameFinished,
  hasBet,
  canDouble,
  canSurrender,
  canSplit,
  insuranceOffered,
  hint,
  stats,
  showStats,
  onToggleStats,
  onResetCamera,
  isSplit,
  activeHandIndex,
  splitHands,
}) {
  const [showRules, setShowRules] = useState(false);

  // Disable HIT / STAND when player has bust or already stood
  const isBust = PlayerHand.getScore() > 21;
  const disableActions = isBust || isStand;

  return (
    <>
      {/* ── Top display ──────────────────────────────────────────────────── */}
      <div className="hud">
        <div className="hud-top">
          <span>💸 {monney}</span>
          <span>🎯 {bet}</span>
        </div>

        {/* ── Action area ─────────────────────────────────────────────────── */}
        <div className="hud-actions">

          {/* ── Insurance prompt ────────────────────────────────────────── */}
          {insuranceOffered && (
            <div className="insurance-prompt">
              <span className="insurance-label">
                Insurance? (costs {Math.floor(bet / 2)} chips, pays 2:1)
              </span>
              <div className="insurance-btns">
                <button className="hud-btn insurance-yes" onClick={onTakeInsurance}>
                  YES
                </button>
                <button className="hud-btn insurance-no" onClick={onDeclineInsurance}>
                  NO
                </button>
              </div>
            </div>
          )}

          {/* ── Split hand indicator ─────────────────────────────────────── */}
          {isSplit && !isGameFinished && splitHands.length > 0 && (
            <div className="split-indicator">
              {splitHands.map((h, i) => (
                <span
                  key={i}
                  className={`split-hand-badge ${i === activeHandIndex ? 'active' : ''} ${h.busted ? 'busted' : ''}`}
                >
                  Hand {i + 1}
                  {h.busted ? ' 💥' : i === activeHandIndex ? ' ←' : ''}
                </span>
              ))}
            </div>
          )}

          {/* ── Hint display ─────────────────────────────────────────────── */}
          {hint && hasBet && !isGameFinished && (
            <div className="hint-badge">
              💡 Basic strategy: <strong>{hint}</strong>
            </div>
          )}

          {/* ── Main game buttons ────────────────────────────────────────── */}
          {isGameFinished ? (
            <button className="hud-btn replay" onClick={onRetry}>
              CONTINUE
            </button>
          ) : hasBet && !insuranceOffered ? (
            <>
              {/* HIT */}
              <button
                className={disableActions ? "hud-btn-disable" : "hud-btn hit"}
                onClick={!disableActions ? onHit : undefined}
              >
                HIT
              </button>

              {/* STAND */}
              <button
                className={disableActions ? "hud-btn-disable" : "hud-btn stand"}
                onClick={!disableActions ? onStand : undefined}
              >
                STAND
              </button>

              {/* DOUBLE DOWN — only on first two cards */}
              {canDouble && (
                <button className="hud-btn double" onClick={onDoubleDown}>
                  DOUBLE
                </button>
              )}

              {/* SPLIT — only on matching pair */}
              {canSplit && (
                <button className="hud-btn split" onClick={onSplit}>
                  SPLIT
                </button>
              )}

              {/* SURRENDER — only on first two cards, not after split */}
              {canSurrender && (
                <button className="hud-btn surrender" onClick={onSurrender}>
                  SURRENDER
                </button>
              )}

              {/* HINT — shows basic-strategy recommendation */}
              {!disableActions && (
                <button className="hud-btn hint-btn" onClick={onHint}>
                  HINT
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* ── Camera reset ──────────────────────────────────────────────────── */}
      <button className="reset-camera-btn" onClick={onResetCamera}>
        Reset Camera
      </button>

      {/* ── Stats toggle ──────────────────────────────────────────────────── */}
      <button
        className="stats-toggle-btn"
        onClick={onToggleStats}
        title="Toggle statistics"
      >
        📊 STATS
      </button>

      {/* ── Stats panel ───────────────────────────────────────────────────── */}
      {showStats && <StatsPanel stats={stats} monney={monney} />}

      {/* ── Rules button ──────────────────────────────────────────────────── */}
      <button
        className="rules-floating-btn"
        onClick={() => setShowRules(true)}
      >
        🃏 RULES
      </button>

      {/* ── Rules overlay ─────────────────────────────────────────────────── */}
      {showRules && (
        <div className="rules-overlay" onClick={() => setShowRules(false)}>
          <div className="rules-container" onClick={e => e.stopPropagation()}>
            <h1>🃏 Blackjack Rules</h1>

            <div className="rules-content">
              <h3>🎯 Objective</h3>
              <p>
                Get as close to <strong>21</strong> as possible without going over,
                and beat the dealer.
              </p>

              <h3>🃏 Card Values</h3>
              <ul>
                <li>Number cards (2–10) = face value</li>
                <li>J, Q, K = 10</li>
                <li>Ace = 1 or 11 (best value chosen automatically)</li>
              </ul>

              <h3>🃏 Natural Blackjack</h3>
              <p>
                Ace + any 10-value card on the first two cards = Blackjack.
                Pays <strong>3:2</strong> (1.5× your bet profit).
              </p>

              <h3>🖐 Player Actions</h3>
              <ul>
                <li><strong>HIT</strong> – draw another card</li>
                <li><strong>STAND</strong> – end your turn</li>
                <li>
                  <strong>DOUBLE DOWN</strong> – first two cards only: double your
                  bet, draw exactly one card
                </li>
                <li>
                  <strong>SPLIT</strong> – when you have a pair: split into two hands,
                  each gets a new card. Aces receive one card only.
                </li>
                <li>
                  <strong>SURRENDER</strong> – first two cards only: forfeit the hand,
                  recover <strong>50%</strong> of your bet
                </li>
                <li>
                  <strong>INSURANCE</strong> – when dealer shows Ace: pay half your
                  bet. Pays <strong>2:1</strong> if dealer has Blackjack
                </li>
              </ul>

              <h3>🤖 Dealer Rules (Vegas)</h3>
              <ul>
                <li>Dealer hits on any total ≤ 16</li>
                <li>Dealer hits on <strong>soft 17</strong> (Ace + 6)</li>
                <li>Dealer stands on hard 17 or higher</li>
                <li>Dealer peeks for Blackjack when showing Ace</li>
              </ul>

              <h3>📦 Shoe</h3>
              <p>6 standard decks (312 cards). Reshuffled at 75% penetration.</p>

              <h3>💰 Payouts</h3>
              <ul>
                <li>Blackjack → <strong>+1.5× bet</strong> (3:2)</li>
                <li>Normal win → <strong>+1× bet</strong></li>
                <li>Push (tie) → bet returned</li>
                <li>Dealer Blackjack → lose bet (unless you also have BJ → push)</li>
                <li>Insurance win → <strong>+2× insurance bet</strong></li>
              </ul>
            </div>

            <button className="rules-close-btn" onClick={() => setShowRules(false)}>
              CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  );
}
