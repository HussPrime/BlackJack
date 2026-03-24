import { AudioListener, AudioLoader, Audio } from "three"
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import { useThree } from "@react-three/fiber"

const Sound = forwardRef((props, ref) => {
  const { camera } = useThree()

  const listenerRef = useRef(null)
  const loaderRef = useRef(null)

  const soundsRef = useRef({
    pickup: null,
    flip: null,
    chip: null,
    shuffle: null
  })

  useEffect(() => {
    const listener = new AudioListener()
    const loader = new AudioLoader()

    listenerRef.current = listener
    loaderRef.current = loader

    camera.add(listener)

    // helper pour créer un son
    const createSound = (path, volume = 0.3) => {
      const sound = new Audio(listener)

      loader.load(path, (buffer) => {
        sound.setBuffer(buffer)
        sound.setLoop(false)
        sound.setVolume(volume)
      })

      return sound
    }

    // 🎵 chargement des sons
    soundsRef.current.pickup = createSound("sounds/pickup_card.mp3", 0.25)
    soundsRef.current.chip = createSound("sounds/chip.mp3", 0.4)
    soundsRef.current.shuffle = createSound("sounds/shuffle_card.mp3", 0.3)

    return () => {
      camera.remove(listener)
    }
  }, [camera])

  // 🔊 helper play
  const play = (sound) => {
    if (!sound || !sound.buffer) return

    if (sound.isPlaying) {
      sound.stop()
    }

    sound.play()
  }

  // 🎮 fonctions exposées
  useImperativeHandle(ref, () => ({
    playPickUpCard: () => play(soundsRef.current.pickup),
    playChip: () => play(soundsRef.current.chip),
    playShuffle: () => play(soundsRef.current.shuffle)
  }))

  return null
})

export default Sound