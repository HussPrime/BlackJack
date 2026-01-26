import { useGLTF } from '@react-three/drei'

export default function Card({
  card,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [0.0025, 0.0025, 0.0025],
  onClick,
}) {
  const { nodes } = useGLTF('/card_deck/card_deck.gltf')

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onClick}
    >
      {/* Chaque carte est composée de 3 meshes */}
      {card.geometries.map((name) => (
        <mesh
          key={name}
          geometry={nodes[name].geometry}
          material={nodes[name].material}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  )
}
