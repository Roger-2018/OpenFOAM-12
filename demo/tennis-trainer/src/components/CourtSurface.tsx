import { Line } from '@react-three/drei'
import { DoubleSide } from 'three'
import { COURT, COURT_COLORS } from '../court/dimensions'

function courtLine(points: [number, number, number][]) {
  return (
    <Line
      points={points}
      color={COURT_COLORS.lines}
      lineWidth={1.5}
      transparent
      opacity={0.95}
    />
  )
}

export function CourtSurface() {
  const { halfLength: L, singlesHalfWidth: W, serviceLineFromNet: S } = COURT
  const y = 0.01

  const boundary: [number, number, number][] = [
    [-W, y, -L],
    [W, y, -L],
    [W, y, L],
    [-W, y, L],
    [-W, y, -L],
  ]

  const center: [number, number, number][] = [
    [0, y, -L],
    [0, y, L],
  ]

  const serviceNear: [number, number, number][] = [
    [-W, y, -S],
    [W, y, -S],
  ]
  const serviceFar: [number, number, number][] = [
    [-W, y, S],
    [W, y, S],
  ]

  const serviceCenterNear: [number, number, number][] = [
    [0, y, -S],
    [0, y, 0],
  ]
  const serviceCenterFar: [number, number, number][] = [
    [0, y, S],
    [0, y, 0],
  ]

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W * 2 + 4, L * 2 + 4]} />
        <meshStandardMaterial color={COURT_COLORS.surface} roughness={0.85} />
      </mesh>
      {courtLine(boundary)}
      {courtLine(center)}
      {courtLine(serviceNear)}
      {courtLine(serviceFar)}
      {courtLine(serviceCenterNear)}
      {courtLine(serviceCenterFar)}
    </group>
  )
}

export function Net() {
  const { singlesHalfWidth: W, netHeight: H, netPostHeight: PH } = COURT
  return (
    <group>
      <mesh position={[0, H / 2, 0]}>
        <boxGeometry args={[W * 2, H, 0.06]} />
        <meshStandardMaterial
          color={COURT_COLORS.net}
          transparent
          opacity={0.35}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[-W - 0.15, PH / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, PH, 12]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[W + 0.15, PH / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, PH, 12]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
    </group>
  )
}
