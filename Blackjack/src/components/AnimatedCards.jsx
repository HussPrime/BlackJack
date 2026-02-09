import { animated, useSpring, useTransition } from "@react-spring/three"
import Card_Deck from "./Card_deck"

export const AnimatedPickUpCard = ({card, position, rotation, from = [0.75, 0, -0.5], delay = 0}) => {
    const spring = useSpring({
    from: {
      position: from, 
      rotation: [-Math.PI / 2, Math.PI, 0],
      scale: 0.8
    },
    delay,
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
