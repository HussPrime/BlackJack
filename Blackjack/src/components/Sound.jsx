import { AudioListener, AudioLoader, Audio } from "three"
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import { useThree } from "@react-three/fiber"

const Sound = forwardRef((props, ref) => {
  const { camera } = useThree()

  const listenerRef = useRef(null)
  const soundRef = useRef(null)
  const loaderRef = useRef(null)

  // Initialisation (une seule fois)
  useEffect(() => {
    const listener = new AudioListener()
    const sound = new Audio(listener)
    const loader = new AudioLoader()

    listenerRef.current = listener
    soundRef.current = sound
    loaderRef.current = loader

    camera.add(listener)

    // Préchargement du son
    loader.load("sounds/pickup_card.mp3", (buffer) => {
      sound.setBuffer(buffer)
      sound.setLoop(false)
      sound.setVolume(0.25)
    })

    return () => {
      camera.remove(listener)
    }
  }, [camera])

  // Fonction pour jouer le son
  const playPickUpCard = () => {
    const sound = soundRef.current
    if (!sound || !sound.buffer) return

    if (sound.isPlaying) {
      sound.stop()
    }

    sound.play()
  }

  // Exposer les fonctions au parent
  useImperativeHandle(ref, () => ({
    playPickUpCard
  }))

  return null
})

export default Sound