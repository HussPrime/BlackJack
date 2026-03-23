import { useState, useRef } from "react"
import PlayerHand from "./PlayerHand";

export default function HUD({
  monney,
  bet,
  onHit,
  onStand,
  onRetry,
  onDouble,
  isStand,
  isGameFinished,
  hasBet,
  onResetCamera,
  isFirstRound
}) {
  const [showRules, setShowRules] = useState(false)
  const isBust = PlayerHand.getScore() 

  return (
    <>
    <div className="hud">

      <div className="hud-top">
        <span>💸 Argent : {monney}</span>
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
            <button className={isBust || isStand || monney < bet || !isFirstRound ? "hud-btn-disable" : "hud-btn double"} onClick={!isBust && !isStand ? onDouble : function() {}}>
              Double
            </button> : <></>
            </>
            :
            <></>
        }
      </div>

    </div>

    {/* <div className="camera-hint">
      Press <strong>R</strong> to reset camera
    </div> */}
    
    <button className="reset-camera-btn" onClick={onResetCamera}>
      Réinitialiser la caméra
    </button>

    {/* BOUTON RULES FIXE TOUJOURS VISIBLE */}
      <button
        className="rules-floating-btn"
        onClick={() => setShowRules(true)}
      >
        🃏 RÈGLES
      </button>

      {/* FULLSCREEN RULES */}
      {showRules && (
        <div className="rules-overlay" onClick={() => setShowRules(false)}>
          <div
            className="rules-container"
            onClick={(e) => e.stopPropagation()}
          >
            <h1>🃏 Règles du Blackjack</h1>
      
            <div className="rules-content">
              <h3>🎯 Objectif</h3>
              <p>
                Atteindre <strong>21</strong> ou s’en approcher le plus possible sans dépasser.
              </p>
          
              <h3>🃏 Blackjack</h3>
              <p>
                Un Blackjack se produit lorsque vos deux premières cartes totalisent <strong>21</strong> (un As + une carte valant 10). C’est la meilleure main.
              </p>
              <p>
                Si vous gagnez avec un Blackjack, vous recevez <strong>2.5× votre mise</strong> (au lieu des 2× habituels).
              </p>
          
              <h3>🃏 Valeur des cartes</h3>
              <ul>
                <li>Cartes numériques = valeur indiquée</li>
                <li>Valet, Dame, Roi = 10</li>
                <li>As = 1 ou 11 (choix automatique le plus avantageux)</li>
              </ul>
          
              <h3>🖐 Tour du joueur</h3>
              <ul>
                <li><strong>HIT</strong> → tirer une carte</li>
                <li><strong>STAND</strong> → terminer son tour</li>
                <li><strong>DOUBLE</strong> → doubler sa mise, tirer une seule carte puis terminer son tour</li>
                <li>Si vous dépassez 21 → vous perdez</li>
              </ul>
          
              <h3>🤖 Règles du croupier</h3>
              <ul>
                <li>Le croupier tire jusqu’à atteindre au moins 17</li>
              </ul>
          
              <h3>💰 Gains</h3>
              <ul>
                <li>Blackjack → 2.5× la mise</li>
                <li>Victoire normale → 2× la mise</li>
                <li>Égalité → récupération de la mise</li>
                <li>Dépassement (bust) → perte de la mise</li>
              </ul>
            </div>
      
            <button
              className="rules-close-btn"
              onClick={() => setShowRules(false)}
            >
              FERMER
            </button>
          </div>
        </div>
      )}
    </>
  );
}
