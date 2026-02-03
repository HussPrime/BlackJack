import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import { Environment, OrbitControls } from "@react-three/drei"
import Blackjack_table from "./Blackjack_table"
import { AnimatedPickUpCard } from "./AnimatedCards"
import Card_Deck from "./Card_deck"
import Chip from "./Chip"
import { AnimatedChip } from "./AnimatedChips"

export default function HUD3D({
    dealerCards,
    playerCards,
    deck,
    monney,
    bet,
    hasBet
}){
  // Fonctions pour générer les piles de jetons
  function renderPlayerChips(amount, startPos = [0.25, 0.875, 0.15]) {
    const chipValues = [10000, 2000, 1000, 500, 200, 100]
    let remaining = amount
    let xOffset = 0
    let index = 0

    const chipData = []

    for (let value of chipValues) {
      let yOffset = 0
      let chipCount = Math.floor(remaining / value)

      for (let i = 0; i < chipCount; i++) {
        chipData.push({
          id: `player-chip-${index}`,
          amount: value,
          position: [
            startPos[0] + xOffset,
            startPos[1] + yOffset,
            startPos[2]
          ],
          delay: index * 20
        })

        yOffset += 0.005
        index++
      }

      remaining -= chipCount * value
      if (chipCount > 0) xOffset += 0.12
    }

    return chipData.map(chip => (
      <AnimatedChip
        key={chip.id}
        amount={chip.amount}
        position={chip.position}
        delay={chip.delay}
      />
    ))
  }

  function renderDealerChips(
    startPos = [-0.8, 0.875, -0.6],
    stacksPerRow = 3,
    rows = 2,
    xSpacing = 0.14,
    zSpacing = 0.18
  ) {
    const chipValues = [10000, 2000, 1000, 500, 200, 100]
    const chips = []
    let index = 0

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < stacksPerRow; col++) {
        const baseX = startPos[0] + col * xSpacing
        const baseZ = startPos[2] + row * zSpacing
        let yOffset = 0

        for (let value of chipValues) {
          const chipCount = Math.floor(Math.random() * 8) + 4

          for (let i = 0; i < chipCount; i++) {
            chips.push({
              id: `dealer-chip-${index}`,
              amount: value,
              position: [
                baseX + (Math.random() - 0.5) * 0.015,
                startPos[1] + yOffset,
                baseZ + (Math.random() - 0.5) * 0.015
              ],
              delay: index * 10
            })

            yOffset += 0.005
            index++
          }
        }
      }
    }

    return chips.map(chip => (
      <AnimatedChip
        key={chip.id}
        amount={chip.amount}
        position={chip.position}
        delay={chip.delay}
      />
    ))
  }

  function renderBetChips(amount, startPos = [0, 0.875, 0]) {
    const chipValues = [10000, 2000, 1000, 500, 200, 100]
    let remaining = amount
    let index = 0

    const chipData = []
    const stackSpacing = 0.12

    const stackCounts = chipValues.map(value => {
      const count = Math.floor(remaining / value)
      remaining -= count * value
      return count
    })

    const totalStacks = stackCounts.filter(c => c > 0).length
    const centerOffset = ((totalStacks - 1) * stackSpacing) / 2

    remaining = amount
    let stackIndex = 0

    for (let value of chipValues) {
      let yOffset = 0
      let chipCount = Math.floor(remaining / value)

      if (chipCount > 0) {
        const xOffset = stackIndex * stackSpacing - centerOffset

        for (let i = 0; i < chipCount; i++) {
          chipData.push({
            id: `bet-chip-${index}`,
            amount: value,
            position: [
              startPos[0] + xOffset,
              startPos[1] + yOffset,
              startPos[2]
            ],
            delay: index * 20
          })

          yOffset += 0.005
          index++
        }

        stackIndex++
        remaining -= chipCount * value
      }
    }

    return chipData.map(chip => (
      <AnimatedChip
        key={chip.id}
        amount={chip.amount}
        position={chip.position}
        delay={chip.delay}
      />
    ))
  }






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

        {/*<OrbitControls/>*/}

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

          {renderPlayerChips(hasBet ? monney : monney-bet)}
          {renderDealerChips()}
          {renderBetChips(bet)}

          
          {/*<Chip amount={1000} position={[0.25, 0.875, 0.15]}/>*/}
          {/*<Casino/>*/}
        </Suspense>
      </Canvas>
    )
}