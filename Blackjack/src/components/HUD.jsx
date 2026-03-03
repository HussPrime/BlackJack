import { useState } from "react"
import PlayerHand from "./PlayerHand";

export default function HUD({
  monney,
  bet,
  onHit,
  onStand,
  onRetry,
  isStand,
  isGameFinished,
  hasBet
}) {
  const [showRules, setShowRules] = useState(false)
  const isBust = PlayerHand.getScore() 

  return (
    <>
    <div className="hud">

      <div className="hud-top">
        <span>💸 Money : {monney}</span>
        <span>🎯 Bet : {bet}</span>
      </div>

      <div className="hud-actions">
        {
            isGameFinished? 
            <button className="hud-btn replay" onClick={onRetry}>CONTINUE</button> :
            hasBet ?
            <>
            <button className={isBust || isStand ? "hud-btn-disable" : "hud-btn hit"} onClick={!isBust && !isStand ? onHit : function() {}}>
              HIT
            </button>
            <button className={isBust || isStand ? "hud-btn-disable" : "hud-btn stand"} onClick={!isBust && !isStand ? onStand : function() {}}>
              STAND
            </button>
            </>
            :
            <></>
        }
      </div>

    </div>

    <div className="camera-hint">
      Press <strong>R</strong> to reset camera
    </div>

    {/* BOUTON RULES FIXE TOUJOURS VISIBLE */}
      <button
        className="rules-floating-btn"
        onClick={() => setShowRules(true)}
      >
        🃏 RULES
      </button>

      {/* FULLSCREEN RULES */}
      {showRules && (
        <div className="rules-overlay" onClick={() => setShowRules(false)}>
          <div
            className="rules-container"
            onClick={(e) => e.stopPropagation()}
          >
            <h1>🃏 Blackjack Rules</h1>

            <div className="rules-content">
              <h3>🎯 Objective</h3>
              <p>
                Reach <strong>21</strong> or get as close as possible without going over.
              </p>

              <h3>🃏 Card Values</h3>
              <ul>
                <li>Number cards = face value</li>
                <li>J, Q, K = 10</li>
                <li>Ace = 1 or 11 (automatic best choice)</li>
              </ul>

              <h3>🖐 Player Turn</h3>
              <ul>
                <li><strong>HIT</strong> → draw another card</li>
                <li><strong>STAND</strong> → end your turn</li>
                <li>If you exceed 21 → you lose</li>
              </ul>

              <h3>🤖 Dealer Rules</h3>
              <ul>
                <li>Dealer draws until reaching at least 17</li>
              </ul>

              <h3>💰 Winning</h3>
              <ul>
                <li>Beat dealer → win 2× your bet</li>
                <li>Tie → get your bet back</li>
                <li>Bust → lose your bet</li>
              </ul>
            </div>

            <button
              className="rules-close-btn"
              onClick={() => setShowRules(false)}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  );
}
