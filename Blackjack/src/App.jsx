import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import Blackjack_table from "../public/blackjack_table/Blackjack_table"
import Card_Deck from "../public/card_deck/Card_deck"
import Card from "./components/card"
import { Environment, OrbitControls } from "@react-three/drei"

const BlackJack = () => {
  return(
    <Canvas
      camera={{position: [0, 2, 0], fov: 75}}
    >
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

      <Suspense fallback={null}>
        <Blackjack_table position={[0, 0, -1.15]}/>
        <Card_Deck/>
      </Suspense>
      
    </Canvas>
  )
}

export default BlackJack