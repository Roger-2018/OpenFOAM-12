import { Line, Ring } from '@react-three/drei'
import { useMemo } from 'react'
import type { TrajectoryPoint } from '../physics/types'
import { acceleration } from '../physics/forces'
import { ArrowHelper, Vector3 } from 'three'
import { TennisBallMesh } from './TennisBallMesh'
import type { BallColorId } from '../visual/ballColorPresets'

type Props = {
  points: TrajectoryPoint[]
  color: string
  time: number
  showForces: boolean
  kidFriendlyBall: boolean
  ballColor: BallColorId
}

function vecToThree(v: { x: number; y: number; z: number }) {
  return [v.x, v.y, v.z] as [number, number, number]
}

function bounceMarkers(points: TrajectoryPoint[]) {
  const marks: { pos: [number, number, number]; n: number }[] = []
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const cur = points[i]
    if (
      prev.velocity.y < 0 &&
      cur.velocity.y > 0 &&
      cur.position.y < 0.12
    ) {
      marks.push({
        pos: [cur.position.x, 0.025, cur.position.z],
        n: marks.length + 1,
      })
    }
  }
  return marks
}

export function TrajectoryVisual({
  points,
  color,
  time,
  showForces,
  kidFriendlyBall,
  ballColor,
}: Props) {
  const linePoints = useMemo(
    () => points.map((p) => vecToThree(p.position)),
    [points],
  )

  const bounces = useMemo(() => bounceMarkers(points), [points])

  const sample = useMemo(() => {
    if (points.length === 0) return null
    for (let i = points.length - 1; i >= 0; i--) {
      if (points[i].t <= time) return points[i]
    }
    return points[0]
  }, [points, time])

  const forceArrows = useMemo(() => {
    if (!sample || !showForces) return null
    const acc = acceleration(sample, {})
    const pos = sample.position
    const scale = 0.08
    const mk = (dir: { x: number; y: number; z: number }, c: string) => {
      const len = Math.hypot(dir.x, dir.y, dir.z)
      if (len < 1e-6) return null
      const arrow = new ArrowHelper(
        new Vector3(dir.x / len, dir.y / len, dir.z / len),
        new Vector3(pos.x, pos.y, pos.z),
        len * scale,
        c,
      )
      return arrow
    }
    return {
      gravity: mk(acc.gravity, '#94a3b8'),
      drag: mk(acc.drag, '#f97316'),
      magnus: mk(acc.magnus, '#22c55e'),
    }
  }, [sample, showForces])

  if (points.length === 0) return null

  return (
    <group>
      <Line
        points={linePoints}
        color={color}
        lineWidth={kidFriendlyBall ? 3.5 : 2}
        transparent
        opacity={kidFriendlyBall ? 0.85 : 1}
      />
      {bounces.map((b) => (
        <group key={`${b.n}-${b.pos.join(',')}`} position={b.pos}>
          <Ring args={[0.12, 0.16, 32]} rotation={[-Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color={b.n === 1 ? '#fde047' : '#f97316'} />
          </Ring>
        </group>
      ))}
      {sample && (
        <TennisBallMesh
          position={vecToThree(sample.position)}
          omega={sample.omega}
          kidFriendly={kidFriendlyBall}
          ballColor={ballColor}
          accent={color}
        />
      )}
      {forceArrows?.gravity && <primitive object={forceArrows.gravity} />}
      {forceArrows?.drag && <primitive object={forceArrows.drag} />}
      {forceArrows?.magnus && <primitive object={forceArrows.magnus} />}
    </group>
  )
}
