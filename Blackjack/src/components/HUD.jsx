export default function HUD({
  playerScore,
  dealerScore,
  monney,
  bet,
  message,
  onHit,
  onStand,
  onRetry,
  isStand,
  isGameFinished,
  hasBet
}) {
    let isHover21 = playerScore >= 21 ? true : false

  return (
    <div className="hud">

      <div className="hud-top">
        <span>🧑 You : {playerScore}</span>
        <span>🎩 Dealer : {dealerScore}</span>
        <span>💸 Monney : {monney}</span>
        <span>🎯 Bet : {bet}</span>
      </div>

      {message && (
        <div className="hud-message">
          {message}
        </div>
      )}

      <div className="hud-actions">
        {
            playerScore > 21 || isGameFinished? 
            <button className="hud-btn replay" onClick={onRetry}>CONTINUE</button> :
            hasBet ?
            <>
            <button className={isHover21 || isStand ? "hud-btn-disable" : "hud-btn hit"} onClick={!isHover21 && !isStand ? onHit : function() {}}>
              HIT
            </button>
            <button className={isHover21 || isStand ? "hud-btn-disable" : "hud-btn stand"} onClick={!isHover21 && !isStand ? onStand : function() {}}>
              STAND
            </button>
            </>
            :
            <></>
        }
      </div>

    </div>
  );
}
