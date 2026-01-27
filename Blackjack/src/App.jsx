import { Canvas } from "@react-three/fiber"
import { Suspense, useEffect, useState } from "react"
import Blackjack_table from "../public/blackjack_table/Blackjack_table"
import Card_Deck from "../public/card_deck/Card_deck"
import { cards } from "./data/cardsData"
import { Environment, OrbitControls } from "@react-three/drei"

import Game from "./components/Game"
import DealerHand from "./components/DealerHand"
import PlayerHand from "./components/PlayerHand"
import Cards from "./components/Cards"
import HUD from "../public/HUD"

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const BlackJack = () => {
  const [playerCards, setPlayerCards] = useState(PlayerHand.cards)
  const [dealerCards, setDealerCards] = useState(DealerHand.cards)
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [message, setMessage] = useState("");
  const [stand, setStand] = useState(false);
  const [restart, setRestart] = useState(false)
  const [isGameFinished, setIsGameFinished] = useState(false)

  useEffect(() => {
    setRestart(false)
    setStand(false)
    setIsGameFinished(false)
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
  }, [restart]);

  const onHit = () => {
    PlayerHand.addCard(Cards.getRandomCard())
    setPlayerCards([...PlayerHand.cards])
    setPlayerScore(PlayerHand.getScore());

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
    await sleep(300)
    setMessage("Dealer's turn");
    setStand(true)
    DealerHand.cards.forEach(c => {
      c.isHidden = false
    });
    setDealerCards([...DealerHand.cards])
    setDealerScore(DealerHand.getScore())

    let isHover16 = DealerHand.getScore() > 16 ? true : false
    while(!isHover16){
      await sleep(800)
      DealerHand.addCard(Cards.getRandomCard(), false)
      setDealerCards([...DealerHand.cards])
      setDealerScore(DealerHand.getScore())
      isHover16 = DealerHand.getScore() > 16 ? true : false
    }

    console.log(`Player score : ${playerScore}\nDealer score : ${dealerScore}`)

    if(playerScore > dealerScore ||dealerScore > 21)
      setMessage("You won")
    else if ( playerScore < dealerScore)
      setMessage("You lost")
    else
      setMessage("Tie")

    setIsGameFinished(true)
  };

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

        {/*<OrbitControls/>*/}

        <Suspense fallback={null}>
          <Blackjack_table position={[0, 0, -1.15]}/>   
          { // Afficher la main du dealer
            dealerCards.map((c, index) => {
            const spacing = 0.15;
            const totalCards = dealerCards.length;
            const offset = ((totalCards - 1) * spacing) / 2;
            
            return (
              <Card_Deck
              key={c.card.id}
              card={c.card}
              rotation={[-Math.PI * 0.5, c.isHidden ? Math.PI : 0, 0]}
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
            
            return (
              <Card_Deck
                key={c.id}
                card={c}
                rotation={[-Math.PI * 0.5, 0, 0]}
                position={[index * spacing - offset, 0.875+index*0.0001, 0.285]} // décale pour centrer
              />
            )
            })
          }
        </Suspense>
      </Canvas>
      <HUD playerScore={playerScore} dealerScore={dealerScore} message={message} onHit={onHit} onStand={onStand} isStand={stand} onRetry={onRetry} isGameFinished={isGameFinished} />
    </>
  )
}

export default BlackJack