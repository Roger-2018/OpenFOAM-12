import { Outlines } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Mesh } from 'three'
import type { Vec3 } from '../physics/types'
import {
  TENNIS_BALL_COLORS,
  visualBallRadius,
} from '../visual/ballAppearance'
import { createTennisBallTexture } from '../visual/tennisBallTexture'

type Props = {
  position: [number, number, number]
  omega: Vec3
  kidFriendly: boolean
  accent?: string
}

export function TennisBallMesh({
  position,
  omega,
  kidFriendly,
  accent,
}: Props) {
  const meshRef = useRef<Mesh>(null)
  const texture = useMemo(() => createTennisBallTexture(), [])
  const radius = visualBallRadius(kidFriendly)

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    mesh.rotation.x += omega.x * delta * 0.22
    mesh.rotation.y += omega.y * delta * 0.22
    mesh.rotation.z += omega.z * delta * 0.22
  })

  return (
    <group position={position}>
      {kidFriendly && (
        <mesh scale={1.22}>
          <sphereGeometry args={[radius, 24, 24]} />
          <meshBasicMaterial
            color={TENNIS_BALL_COLORS.glow}
            transparent
            opacity={0.22}
          />
        </mesh>
      )}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.92}
          metalness={0.02}
          emissive={accent ?? '#3f4d00'}
          emissiveIntensity={kidFriendly ? 0.18 : 0.06}
        />
        {kidFriendly && (
          <Outlines
            thickness={0.015}
            color="#0f172a"
            screenspace
            angle={0}
          />
        )}
      </mesh>
    </group>
  )
}
