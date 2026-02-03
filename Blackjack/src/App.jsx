import { useEffect, useState } from "react"

import Game from "./components/Game"
import DealerHand from "./components/DealerHand"
import PlayerHand from "./components/PlayerHand"
import Cards from "./components/Cards"
import HUD from "./components/HUD"
import Casino from "../public/casino/Casino-transformed"

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
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    setHasBet(false)
    setBet(0)
    setRestart(false)
    setStand(false)
    setIsGameFinished(false)
    Cards.setCards()
    setDeck([...Cards.cards])
    

    if(monney == 0){
      let x = Math.floor(Math.random() * 10) + 1
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
    setPlayerCards([...PlayerHand.cards])
    setPlayerScore(PlayerHand.getScore());
    setDeck([...Cards.cards])

    if (PlayerHand.getScore() > 21) {
      setMessage("You lost");
    }
    else if (PlayerHand.getScore() == 21){
      setMessage("Dealer's turn")
      setStand(true)
      onStand()
    }
  }

  const onStand = async () => {
    await sleep(700)

    setMessage("Dealer's turn")
    setStand(true)

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
      setMessage("You won")
      setMonney(m => m + 2 * bet)
    }
    else if (finalPlayerScore < finalDealerScore){
      setMessage("You lost")
    }
    else{
      setMessage("Tie")
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
        deck={deck}
      />
      <HUD 
        playerScore={playerScore} 
        dealerScore={dealerScore} 
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
          <input type="range" min="0" max={monney} value={bet} onChange={function(e) {setBet(e.target.value)}} step="1" className="bet-slider" />
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