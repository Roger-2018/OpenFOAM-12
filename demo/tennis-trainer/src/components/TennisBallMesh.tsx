import { Outlines } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Mesh } from 'three'
import type { Vec3 } from '../physics/types'
import { visualBallRadius } from '../visual/ballAppearance'
import {
  BALL_COLOR_PRESETS,
  type BallColorId,
} from '../visual/ballColorPresets'
import { createTennisBallTexture } from '../visual/tennisBallTexture'

type Props = {
  position: [number, number, number]
  omega: Vec3
  kidFriendly: boolean
  ballColor: BallColorId
  accent?: string
}

export function TennisBallMesh({
  position,
  omega,
  kidFriendly,
  ballColor,
  accent,
}: Props) {
  const meshRef = useRef<Mesh>(null)
  const scheme = BALL_COLOR_PRESETS[ballColor].colors
  const texture = useMemo(
    () => createTennisBallTexture(scheme),
    [scheme.felt, scheme.feltDark, scheme.seam],
  )
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
            color={scheme.glow}
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
          emissive={accent ?? scheme.emissive}
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
