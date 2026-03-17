import { Canvas, useLoader } from "@react-three/fiber"
import { Suspense, useMemo, useRef } from "react"
import { TextureLoader, RepeatWrapping } from "three"
import { Environment, Text } from "@react-three/drei"
import Blackjack_table from "./Blackjack_table"
import { AnimatedPickUpCard } from "./AnimatedCards"
import Card_Deck from "./Card_deck"
import Chip from "./Chip"
import { AnimatedChip } from "./AnimatedChips"
import CameraController from "./CameraController"
import Dealer from "./Dealer"
import Loader from "./Loader"
import Sound from "./Sound"

export default function HUD3D({
    dealerCards,
    playerCards,
    dealerScore,
    playerScore,
    deck,
    prevDeck,
    monney,
    bet,
    hasBet,
    isGameFinished,
    hasWin,
    message,
    cameraRef,
    soundRef
}){
  const font = "Montserrat/static/Montserrat-Bold.ttf"
  const parquet = useLoader(TextureLoader, `${import.meta.env.BASE_URL}textures/parquet.avif`)
  parquet.wrapS = parquet.wrapT = RepeatWrapping
  parquet.repeat.set(10, 10)

  // Fonctions pour générer les piles de jetons
  function renderPlayerChips(amount, startPos = [0.25, 0, 0.15]) {
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

  function renderDealerChips() {

  const chips = useMemo(() => {
    const chipValues = [10000, 2000, 1000, 500, 200, 100]
    const chipsArray = []
    let index = 0

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const baseX = -0.8 + col * 0.14
        const baseZ = -0.6 + row * 0.18
        let yOffset = 0

        for (let value of chipValues) {
          const chipCount = Math.floor(Math.random() * 8) + 4

          for (let i = 0; i < chipCount; i++) {
            chipsArray.push({
              id: `dealer-chip-${index}`,
              amount: value,
              position: [
                baseX + (Math.random() - 0.5) * 0.015,
                yOffset,
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

    return chipsArray
  }, [])

  return chips.map(chip => (
    <AnimatedChip
      key={chip.id}
      amount={chip.amount}
      position={chip.position}
      delay={chip.delay}
    />
  ))
}

  function renderBetChips(amount, startPos = [0, 0, 0]) {
    if(!isGameFinished){
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
        from={[0.25, 0, 0.15]}
      />
    ))
    }
  }

  const prevDeckIds = new Set(prevDeck.map(c => c.id))


  return(
    <Canvas camera={{position: [0, 1.1, 0], fov: 75}} >
        
      <ambientLight intensity={0.1}/>
      <spotLight 
        color={[255, 255, 255]}
        intensity={.03}
        angle={1.5}
        penumbra={0.2}
        castShadow
      />
      {/* <Environment preset="sunset"/> */}
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
       

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.88, 0]}
        receiveShadow
      >
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial
          map={parquet}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      <CameraController ref={cameraRef} />

      <Suspense fallback={<Loader/>}>
        <Blackjack_table position={[0, -0.8715, -1.15]}/>   
        { // Afficher la main du croupier
          dealerCards.map((c, index) => {
          const spacing = 0.15
          const totalCards = dealerCards.length
          const offset = ((totalCards - 1) * spacing) / 2

          return (
            <AnimatedPickUpCard
              key={c.card.id}
              card={c.card}
              rotation={c.isHidden ? [-Math.PI*0.5, Math.PI, 0] : [-Math.PI*0.5, 0, 0]}
              position={[index * spacing - offset, 0.00111, -0.5]}
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
            position={[index * spacing - offset -0.006, 0.00111+index*0.0001, 0.285]}
            rotation={[-Math.PI * 0.5, 0, 0]}
          />)
          
          })
        }
        { // Afficher le tas
          deck.map((c, index) => {
            const spacing = 0.003; // distance entre les cartes
            const isNew = !prevDeckIds.has(c.id)

            return(
              <AnimatedPickUpCard
                key={c.id}
                card={c}
                from={isNew ? [0.75, -0.5, -0.5] : undefined}
                rotation={[-Math.PI * 0.5, Math.PI, 0]}
                position={[0.75, 0.004+index*spacing, -0.5]}
                delay={isNew ? index * 50 : 0}
              />
            )
          })
        }

        {renderPlayerChips(hasBet ? monney : monney-bet)}
        {renderDealerChips()}
        {renderBetChips(bet)}

        { // Afficher le score du joueur
          <Text 
            font={font} 
            position={[0, 0, 0.495]} 
            rotation={[-Math.PI*0.5, 0, 0]}
            scale={0.09}
          >
            {playerScore}
            {<meshBasicMaterial color={playerScore > 21 || hasWin == 0 ? [1, 0, 0] : hasWin == 1 ? [0, 1, 0] : hasWin == 2 ? [1, 1, 0] : [1, 1, 1]} />}
          </Text>
        }
        
        { // Afficher le score du dealer
          <Text 
            font={font} 
            position={[0, 0, -0.67]} 
            rotation={[-Math.PI*0.5, 0, 0]}
            scale={0.09}
          >
            {dealerScore}
            {<meshBasicMaterial color={dealerScore > 21 || hasWin == 1 ? [1, 0, 0] : hasWin == 0 ? [0, 1, 0] : hasWin == 2 ? [1, 1, 0] : [1, 1, 1]} /> }
          </Text>
        }

        { // Afficher le message
          <Text 
            font={font} 
            position={[0, 0, -0.2]} 
            rotation={[-Math.PI*0.5, 0, 0]}
            scale={0.09}
          >
            {message}
            {<meshBasicMaterial color={ hasWin == 0 ? [1, 0, 0] : hasWin == 1 ? [0, 1, 0] : hasWin == 2 ? [1, 1, 0] : [1, 1, 1]} />}
          </Text>
        }
        
        
        <Dealer/>
        {/*<Casino/>*/}
        <Sound ref={soundRef} />
      </Suspense>
    </Canvas>
  )
}