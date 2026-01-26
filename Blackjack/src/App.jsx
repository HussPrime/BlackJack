import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import Blackjack_table from "../public/blackjack_table/Blackjack_table"
import { Environment, OrbitControls } from "@react-three/drei"

const BlackJack = () => {
  return(
    <Canvas>
      <ambientLight intensity={2}/>
      <OrbitControls/>
      <Suspense fallback={null}>
        <Blackjack_table/>
      </Suspense>
      <Environment preset="sunset"/>
    </Canvas>
  )
}

export default BlackJack