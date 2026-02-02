export default function HUD({
  playerScore,
  dealerScore,
  message,
  onHit,
  onStand,
  onRetry,
  isStand,
  isGameFinished
}) {
    let isHover21 = playerScore >= 21 ? true : false

  return (
    <div className="hud">

      <div className="hud-top">
        <span>🧑 You : {playerScore}</span>
        <span>🎩 Dealer : {dealerScore}</span>
      </div>

      {message && (
        <div className="hud-message">
          {message}
        </div>
      )}

      <div className="hud-actions">
        {
            playerScore > 21 || isGameFinished? 
            <button className="hud-btn stand" onClick={onRetry}>RETRY</button> :
            <>
            <button className={isHover21 || isStand ? "hud-btn-disable" : "hud-btn hit"} onClick={!isHover21 && !isStand ? onHit : function() {}}>
              HIT
            </button>
            <button className={isHover21 || isStand ? "hud-btn-disable" : "hud-btn stand"} onClick={!isHover21 && !isStand ? onStand : function() {}}>
              STAND
            </button>
            </>
        }
      </div>

    </div>
  );
}
