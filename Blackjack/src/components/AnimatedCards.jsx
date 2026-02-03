import { animated, useSpring, useTransition } from "@react-spring/three"
import Card_Deck from "./Card_deck"

export const AnimatedPickUpCard = ({card, position, rotation}) => {
    const spring = useSpring({
    from: {
      position: [0.75, 0.875, -0.5], // deck
      rotation: [-Math.PI / 2, Math.PI, 0],
      scale: 0.8
    },
    to: {
      position,
      rotation,
      scale: 1
    },
    config: {
      tension: 200,
      friction: 25
    }
  })

  return (
    <animated.group
      position={spring.position}
      rotation={spring.rotation}
      scale={spring.scale}
    >
      <Card_Deck card={card} />
    </animated.group>
  )
}
