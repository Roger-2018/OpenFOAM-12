import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { COURT } from '../court/dimensions'
import type { PlayMode } from '../presets/strokes'
import { CourtSurface, Net } from './CourtSurface'
import { TrajectoryVisual } from './TrajectoryVisual'
import type { TrajectoryPoint } from '../physics/types'

export type CameraPreset = 'side' | 'baseline' | 'top'

const CAMERA: Record<
  CameraPreset,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  side: { position: [13, 4.5, -2], target: [0, 1.2, 4] },
  baseline: { position: [0.5, 2.2, -17], target: [0, 1, 6] },
  top: { position: [0.01, 22, -1], target: [0, 0, 0] },
}

type Props = {
  trajectoryA: TrajectoryPoint[]
  trajectoryB: TrajectoryPoint[]
  colorA: string
  colorB: string
  compare: boolean
  time: number
  showForces: boolean
  camera: CameraPreset
  playMode: PlayMode
}

function SceneContent({
  trajectoryA,
  trajectoryB,
  colorA,
  colorB,
  compare,
  time,
  showForces,
  camera,
  playMode,
}: Props) {
  const cam = CAMERA[camera]
  const baselineZ = -COURT.halfLength
  return (
    <>
      <PerspectiveCamera makeDefault position={cam.position} fov={48} />
      <OrbitControls target={cam.target} enableDamping maxPolarAngle={Math.PI / 2.05} />
      <ambientLight intensity={0.55} />
      <directionalLight castShadow position={[8, 16, -6]} intensity={1.1} />
      <hemisphereLight args={['#dbeafe', '#14532d', 0.35]} />
      <CourtSurface highlightServeTarget={playMode === 'serve'} />
      <Net />
      {playMode === 'serve' && (
        <mesh position={[0.55, 0.04, baselineZ + 0.05]}>
          <boxGeometry args={[0.5, 0.08, 0.5]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      )}
      <TrajectoryVisual
        points={trajectoryA}
        color={colorA}
        time={time}
        showForces={showForces}
      />
      {compare && (
        <TrajectoryVisual
          points={trajectoryB}
          color={colorB}
          time={time}
          showForces={false}
        />
      )}
    </>
  )
}

export function TennisScene(props: Props) {
  return (
    <Canvas shadows className="tennis-canvas" key={props.camera}>
      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', 28, 55]} />
      <SceneContent {...props} />
    </Canvas>
  )
}
