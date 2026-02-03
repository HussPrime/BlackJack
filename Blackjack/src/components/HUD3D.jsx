import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import { Environment, OrbitControls } from "@react-three/drei"
import Blackjack_table from "./Blackjack_table"
import { AnimatedPickUpCard } from "./AnimatedCards"
import Card_Deck from "./Card_deck"
import Chip from "./Chip"

export default function HUD3D({
    dealerCards,
    playerCards,
    deck
}){
    return(
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


          <Chip amount={1000}/>
          {/*<Casino/>*/}
        </Suspense>
      </Canvas>
    )
}