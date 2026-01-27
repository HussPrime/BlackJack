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

const BlackJack = () => {
  const [playerCards, setPlayerCards] = useState(PlayerHand.cards)
  const [dealerCards, setDealerCards] = useState(DealerHand.cards)

  useEffect(() => {
    Game.initGame()
    setPlayerCards([...PlayerHand.cards])
    setDealerCards([...DealerHand.cards])
  }, [])

  const hit = () => {
    PlayerHand.addCard(Cards.getRandomCard())
    setPlayerCards([...PlayerHand.cards])
  }

  return(
    <div>
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

        <OrbitControls/>

        <Blackjack_table position={[0, 0, -1.15]}/>   
        {
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
        {
          playerCards.map((c, index) => {
            const spacing = 0.15; // distance entre les cartes
            const totalCards = playerCards.length;
            const offset = ((totalCards - 1) * spacing) / 2; // calcule la moitié de la largeur totale
          
            return (
              <Card_Deck
                key={c.id}
                card={c}
                rotation={[-Math.PI * 0.5, 0, 0]}
                position={[index * spacing - offset, 0.875, 0.25]} // décale pour centrer
              />
            )
          })
        }
      </Canvas>
      <button onClick={hit}>Hit</button>
    </div>
  )
}

export default BlackJack