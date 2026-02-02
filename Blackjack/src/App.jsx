import { Canvas } from "@react-three/fiber"
import { Suspense, useEffect, useState } from "react"
import Blackjack_table from "./components/Blackjack_table"
import Card_Deck from "./components/Card_deck"
import { cards } from "./data/cardsData"
import { Environment, OrbitControls } from "@react-three/drei"

import Game from "./components/Game"
import DealerHand from "./components/DealerHand"
import PlayerHand from "./components/PlayerHand"
import Cards from "./components/Cards"
import HUD from "./components/HUD"
import Casino from "../public/casino/Casino-transformed"

import { AnimatedPickUpCard } from "./components/AnimatedCards"


const BlackJack = () => {
  const [playerCards, setPlayerCards] = useState(PlayerHand.cards)
  const [dealerCards, setDealerCards] = useState(DealerHand.cards)
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [message, setMessage] = useState("");
  const [stand, setStand] = useState(false);
  const [restart, setRestart] = useState(false)
  const [isGameFinished, setIsGameFinished] = useState(false)
  const [deck, setDeck] = useState([])
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    setRestart(false)
    setStand(false)
    setIsGameFinished(false)
    Game.initGame();

    setPlayerCards([...PlayerHand.cards]);
    setDealerCards([...DealerHand.cards]);

    setPlayerScore(PlayerHand.getScore());
    setDealerScore(DealerHand.getScore());

    setDeck([...Cards.cards])

    if (PlayerHand.getScore() == 21){
      setMessage("Dealer's turn")
      setStand(true)
      onStand()
    }
    else{
      setMessage("Your turn");
    }
  }, [restart]);

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

  if (finalDealerScore > 21 || finalPlayerScore > finalDealerScore)
    setMessage("You won")
  else if (finalPlayerScore < finalDealerScore)
    setMessage("You lost")
  else
    setMessage("Tie")

  setIsGameFinished(true)
}

  const onRetry = () => {
    setRestart(true)
  }
  
  return(
    <>
      <Canvas camera={{position: [0, 2, 0], fov: 75}} >
        <ambientLight intensity={2}/>
        <Environment preset="sunset"/>
        {/*
          <spotLight 
          color={[255, 0, 0]}
          intensity={1.5}
          angle={0.6}
          penumbra={0.5}
          position={[5, 5, 0]}
          castShadow
          shadow-bias={-0.0001}
          />
          */}

        {<OrbitControls/>}

        <Suspense fallback={null}>
          <Blackjack_table position={[0, 0, -1.15]}/>   
          { // Afficher la main du dealer
            dealerCards.map((c, index) => {
            const spacing = 0.15
            const totalCards = dealerCards.length
            const offset = ((totalCards - 1) * spacing) / 2

            return (
              <AnimatedPickUpCard
                key={c.card.id}
                card={c.card}
                rotation={c.isHidden ? [-Math.PI*0.5, Math.PI, 0] : [-Math.PI*0.5, 0, 0]}
                position={[index * spacing - offset, 0.875, -0.5]}
              />
            )
          })
          }
          { // Afficher la main du joueur
            playerCards.map((c, index) => {
            const spacing = 0.03; // distance entre les cartes
            const totalCards = playerCards.length;
            const offset = ((totalCards - 1) * spacing) / 2; // calcule la moitié de la largeur totale

            return(<AnimatedPickUpCard
              key={c.id}
              card={c}
              position={[index * spacing - offset, 0.875+index*0.0001, 0.285]}
              rotation={[-Math.PI * 0.5, 0, 0]}
            />)
            
            })
          }
          { // Afficher le tas
            deck.map((c, index) => {
              const spacing = 0.003; // distance entre les cartes

              return(
                <Card_Deck
                  key={c.id}
                  card={c}
                  rotation={[-Math.PI * 0.5, Math.PI, 0]}
                  position={[0.75, 0.875+index*spacing, -0.5]}
                />
              )
            })
          }

          {/*<Casino/>*/}
        </Suspense>
      </Canvas>
      <HUD playerScore={playerScore} dealerScore={dealerScore} message={message} onHit={onHit} onStand={onStand} isStand={stand} onRetry={onRetry} isGameFinished={isGameFinished} />
    </>
  )
}

export default BlackJack