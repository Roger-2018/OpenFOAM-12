import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
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
}: Props) {
  const cam = CAMERA[camera]
  return (
    <>
      <PerspectiveCamera makeDefault position={cam.position} fov={48} />
      <OrbitControls target={cam.target} enableDamping maxPolarAngle={Math.PI / 2.05} />
      <ambientLight intensity={0.55} />
      <directionalLight castShadow position={[8, 16, -6]} intensity={1.1} />
      <hemisphereLight args={['#dbeafe', '#14532d', 0.35]} />
      <CourtSurface />
      <Net />
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
