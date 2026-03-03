import { useEffect, useRef } from "react"
import { OrbitControls } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { gsap } from "gsap"

export default function CameraController() {
    const controlsRef = useRef()
  const { camera } = useThree()

  // Stocke la position initiale (au premier render)
  const initialPosition = useRef(null)
  const initialTarget = useRef(null)

  useEffect(() => {
    if (!initialPosition.current) {
      initialPosition.current = camera.position.clone()
    }
    if (controlsRef.current && !initialTarget.current) {
      initialTarget.current = controlsRef.current.target.clone()
    }
  }, [camera])

  // Reset à la position initiale
  const resetCamera = () => {
    if (initialPosition.current) {
      camera.position.copy(initialPosition.current)
    }

    if (controlsRef.current && initialTarget.current) {
      controlsRef.current.target.copy(initialTarget.current)
      controlsRef.current.update()
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === "r") {
        resetCamera()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return <OrbitControls 
    ref={controlsRef}           
    minPolarAngle={0}
    maxPolarAngle={1.2}

    minAzimuthAngle={-Math.PI / 4}
    maxAzimuthAngle={Math.PI / 4}

    minDistance={0.55}
    maxDistance={2}
  />
}