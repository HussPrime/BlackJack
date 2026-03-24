import { useEffect, useRef, useState } from "react"

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
  const [money, setMoney] = useState(1000);
  const [bet, setBet] = useState(0);
  const [hasBet, setHasBet] = useState(false);
  const roundBetRef = useRef(0)
  const baseBetRef = useRef(0) 
  const [message, setMessage] = useState("");
  const [stand, setStand] = useState(false);
  const [restart, setRestart] = useState(false)
  const [isGameFinished, setIsGameFinished] = useState(false)
  const [deck, setDeck] = useState([])
  const [prevDeck, setPrevDeck] = useState([])
  const [hasWin, setHasWin] = useState(-1)
  const [hasDoubled, setHasDoubled] = useState(false)
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const cameraRef = useRef()
  const soundRef = useRef()

  useEffect(() => {
    setHasWin(-1)
    setHasBet(false)
    setBet(Math.min(baseBetRef.current, money))
    setRestart(false)
    setStand(false)
    setIsGameFinished(false)
    Cards.setCards()
    setPrevDeck([...deck])
    setDeck([...Cards.cards])
    

    if(money <= 0){
      let x = 100 //Math.floor(Math.random() * 100) + 1
      setMoney(x)
      setMessage(`Quelqu'un vous a donné ${x}`)
    }

    soundRef.current?.playShuffle()

  }, [restart]);

  useEffect(() => {
    if(hasBet){
      Game.initGame();
      setHasDoubled(false)

      setPlayerCards([...PlayerHand.cards]);
      setDealerCards([...DealerHand.cards]);

      setPlayerScore(PlayerHand.getScore());
      setDealerScore(DealerHand.getScore());


      if (PlayerHand.getScore() == 21){
        setMessage("Tour du croupier")
        setStand(true)
        onStand()
      }
      else{
        setMessage("Votre tour");
      }
    }

  }, [hasBet])

  const revealDealerCards = async () => {
    await sleep(250)
    DealerHand.cards.forEach(c => {
      c.isHidden = false
    })
    soundRef.current?.playPickUpCard()
    setDealerCards([...DealerHand.cards])
  }

  const onHit = () => {
    PlayerHand.addCard(Cards.getRandomCard({soundRef}))
    const newScore = PlayerHand.getScore()
    soundRef.current?.playPickUpCard()

    setPlayerCards([...PlayerHand.cards])
    setPlayerScore(newScore)
    setPrevDeck([...deck])
    setDeck([...Cards.cards])

    if (newScore > 21) {
      revealDealerCards()
      setMessage("Perdu")
      setIsGameFinished(true)
      setStand(true) 
    }
    else if (newScore === 21) {
      setMessage("Tour du croupier")
      setStand(true)
      onStand()
    }
  }

  const onStand = async () => {
    setStand(true)
    const betAmount = roundBetRef.current
    
    await sleep(700)

    setMessage("Tour du croupier")

    await revealDealerCards()
    setDealerCards([...DealerHand.cards])
    setDealerScore(DealerHand.getScore())

    while (DealerHand.getScore() <= 16) {
      await sleep(1350)
      DealerHand.addCard(Cards.getRandomCard({soundRef}), false)
      setDealerCards([...DealerHand.cards])
      setDealerScore(DealerHand.getScore())
      setPrevDeck([...deck])
      setDeck([...Cards.cards])
    }

    const finalPlayerScore = PlayerHand.getScore()
    const finalDealerScore = DealerHand.getScore()

    // Check bj 
    if(finalPlayerScore == 21 && finalDealerScore != 21 && PlayerHand.cards.length == 2){
      setHasWin(1)
      setMessage("BlackJack")
      await sleep(500)
      soundRef.current?.playChip()
      setMoney(m => m + 2.5 * betAmount)
    }
    else if (finalDealerScore > 21 || finalPlayerScore > finalDealerScore){
    setHasWin(1)
    setMessage("Gagné")
    await sleep(500)
    soundRef.current?.playChip()
    setMoney(m => m + 2 * betAmount)
    }
    else if (finalPlayerScore < finalDealerScore){
      setHasWin(0)
      setMessage("Perdu")
    }
    else{
      setHasWin(2)
      setMessage("Égalité")
      await sleep(500)
      soundRef.current?.playChip()
      setMoney(m => m + betAmount)
    }
    

    setIsGameFinished(true)
  }

const onDouble = () => {
  if (hasDoubled || money < roundBetRef.current) return

  setHasDoubled(true)

  setMoney(m => m - roundBetRef.current * 0.5)

   roundBetRef.current *= 2
  setBet(roundBetRef.current)

  PlayerHand.addCard(Cards.getRandomCard({soundRef}))

  const newScore = PlayerHand.getScore()

  setPlayerCards([...PlayerHand.cards])
  setPlayerScore(newScore)
  setPrevDeck([...deck])
  setDeck([...Cards.cards])

  if (newScore <= 21) {
    onStand()
  } else {
    revealDealerCards()
    setMessage("Perdu")
    setIsGameFinished(true)
    setStand(true)
  }
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
        prevDeck={prevDeck}
        monney={money}
        bet={bet}
        hasBet={hasBet}
        isGameFinished={isGameFinished}
        hasWin={hasWin}
        message={message} 
        cameraRef={cameraRef}
        soundRef={soundRef}
      />
      <HUD 
        monney={money} 
        onHit={onHit} 
        onStand={onStand} 
        onDouble={onDouble}
        isStand={stand} 
        onRetry={onRetry} 
        isGameFinished={isGameFinished} 
        hasBet={hasBet}
        bet={bet}
        onResetCamera={() => cameraRef.current?.resetCamera()}
        isFirstRound={PlayerHand.cards.length == 2}
      />
      {
        !hasBet ?
        <div className="hud-bet">
          <span className="bet-label">Mise</span>
          <input
            type="range"
            min="0"
            max={money}
            value={bet}
            onChange={function (e) { setBet(Number(e.target.value)); soundRef.current?.playChip() }}
            step="100"
            className="bet-slider"
          />
          <span className="bet-value">{bet}</span>
          <br/>
          <button className={"hud-btn bet"} onClick={function(){setHasBet(true); setMoney(m => m - bet); roundBetRef.current = bet; baseBetRef.current = bet }}>
            MISER
          </button>
        </div>
        : <></>
      }
    </>
  )
}

export default BlackJack