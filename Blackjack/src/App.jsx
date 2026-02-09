import { useEffect, useState } from "react"

import Game from "./components/Game"
import DealerHand from "./components/DealerHand"
import PlayerHand from "./components/PlayerHand"
import Cards from "./components/Cards"
import HUD from "./components/HUD"
//import Casino from "../public/casino/Casino-transformed"

import HUD3D from "./components/HUD3D"


const BlackJack = () => {
  const [playerCards, setPlayerCards] = useState(PlayerHand.cards)
  const [dealerCards, setDealerCards] = useState(DealerHand.cards)
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [monney, setMonney] = useState(1000);
  const [bet, setBet] = useState(0);
  const [hasBet, setHasBet] = useState(false);
  const [message, setMessage] = useState("");
  const [stand, setStand] = useState(false);
  const [restart, setRestart] = useState(false)
  const [isGameFinished, setIsGameFinished] = useState(false)
  const [deck, setDeck] = useState([])
  const [hasWin, setHasWin] = useState(-1)
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    setHasWin(-1)
    setHasBet(false)
    if(bet > monney)
      setBet(monney)
    setRestart(false)
    setStand(false)
    setIsGameFinished(false)
    Cards.setCards()
    setDeck([...Cards.cards])
    

    if(monney == 0){
      let x = 1000 //Math.floor(Math.random() * 100) + 1
      setMonney(x)
      setMessage(`Someone gave you ${x}`)
    }
  }, [restart]);

  useEffect(() => {
    if(hasBet){
      Game.initGame();

      setPlayerCards([...PlayerHand.cards]);
      setDealerCards([...DealerHand.cards]);

      setPlayerScore(PlayerHand.getScore());
      setDealerScore(DealerHand.getScore());


      if (PlayerHand.getScore() == 21){
        setMessage("Dealer's turn")
        setStand(true)
        onStand()
      }
      else{
        setMessage("Your turn");
      }
    }

  }, [hasBet])

  const onHit = () => {
    PlayerHand.addCard(Cards.getRandomCard())
    const newScore = PlayerHand.getScore()

    setPlayerCards([...PlayerHand.cards])
    setPlayerScore(newScore)
    setDeck([...Cards.cards])

    if (newScore > 21) {
      setMessage("You lost")
      setIsGameFinished(true)
      setStand(true) // IMPORTANT : bloque HIT/STAND
    }
    else if (newScore === 21) {
      setMessage("Dealer's turn")
      setStand(true)
      onStand()
    }
  }

  const onStand = async () => {
    setStand(true)
    
    await sleep(700)

    setMessage("Dealer's turn")

    DealerHand.cards.forEach(c => {
      c.isHidden = false
    })
    setDealerCards([...DealerHand.cards])
    setDealerScore(DealerHand.getScore())

    while (DealerHand.getScore() <= 16) {
      await sleep(1350)
      DealerHand.addCard(Cards.getRandomCard(), false)
      setDealerCards([...DealerHand.cards])
      setDealerScore(DealerHand.getScore())
      setDeck([...Cards.cards])
    }

    const finalPlayerScore = PlayerHand.getScore()
    const finalDealerScore = DealerHand.getScore()

    if (finalDealerScore > 21 || finalPlayerScore > finalDealerScore){
      setHasWin(1)
      setMessage("You won")
      await sleep(500)
      setMonney(m => m + 2 * bet)
    }
    else if (finalPlayerScore < finalDealerScore){
      setHasWin(0)
      setMessage("You lost")
    }
    else{
      setHasWin(2)
      setMessage("Tie")
      await sleep(500)
      setMonney(m => m + bet)
    }

    setIsGameFinished(true)
  }

  const onRetry = () => {
    setRestart(true)
  }
  
  return(
    <>
      <HUD3D
        dealerCards={dealerCards}
        playerCards={playerCards}
        dealerScore={dealerScore}
        playerScore={playerScore}
        deck={deck}
        monney={monney}
        bet={bet}
        hasBet={hasBet}
        isGameFinished={isGameFinished}
        hasWin={hasWin}
      />
      <HUD 
        monney={monney} 
        message={message} 
        onHit={onHit} 
        onStand={onStand} 
        isStand={stand} 
        onRetry={onRetry} 
        isGameFinished={isGameFinished} 
        hasBet={hasBet}
        bet={bet}
      />
      
      {
        !hasBet ?
        <div className="hud-bet">
          <span className="bet-label">Bet</span>
          <input type="range" min="0" max={monney} value={bet} onChange={function(e) {setBet(Number(e.target.value))}} step="100" className="bet-slider" />
          <span className="bet-value">{bet}</span>
          <br/>
          <button className={"hud-btn bet"} onClick={function(){setHasBet(true); setMonney(monney-bet)}}>
            BET
          </button>
        </div>
        : <></>
      }
    </>
  )
}

export default BlackJack