import { forwardRef, useImperativeHandle } from "react"
import { OrbitControls } from "@react-three/drei"
import { useThree } from "@react-three/fiber"

const CameraController = forwardRef((props, ref) => {
  const { camera } = useThree()

  // Fonction de reset
  const resetCamera = () => {
    camera.position.set(0, 1.1, 0)
    camera.lookAt(0, 0, -1)
  }

  // On expose resetCamera via la ref
  useImperativeHandle(ref, () => ({
    resetCamera
  }))

  return (
    <OrbitControls 
      minPolarAngle={0}
      maxPolarAngle={1.2}

      minAzimuthAngle={-Math.PI / 4}
      maxAzimuthAngle={Math.PI / 4}

      minDistance={0.55}
      maxDistance={2}

      enablePan={false}
      enableDamping
      dampingFactor={0.1}
    />
  )
})

export default CameraController