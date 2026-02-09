import PlayerHand from "./PlayerHand";

export default function HUD({
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
    const isBust = PlayerHand.getScore() 

  return (
    <div className="hud">

      <div className="hud-top">
        <span>💸 Money : {monney}</span>
        <span>🎯 Bet : {bet}</span>
      </div>

      {message && (
        <div className="hud-message">
          {message}
        </div>
      )}

      <div className="hud-actions">
        {
            isBust || isGameFinished? 
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
  );
}
