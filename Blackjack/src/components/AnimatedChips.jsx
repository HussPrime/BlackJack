import { animated, useSpring } from "@react-spring/three"
import Chip from "./Chip"

export function AnimatedChip({ amount, position, delay = 0, from = [-0.8, 0, -0.6] }) {
  const spring = useSpring({
    from: {
      position: from, // point d'origine (banque / deck)
      scale: 0.5
    },
    to: {
      position,
      scale: 1
    },
    delay,
    config: {
      tension: 220,
      friction: 22
    }
  })

  return (
    <animated.group position={spring.position} scale={spring.scale}>
      <Chip amount={amount} />
    </animated.group>
  )
}
