import { Line, Sphere } from '@react-three/drei'
import { useMemo } from 'react'
import type { TrajectoryPoint } from '../physics/types'
import { acceleration } from '../physics/forces'
import { ArrowHelper, Vector3 } from 'three'

type Props = {
  points: TrajectoryPoint[]
  color: string
  time: number
  showForces: boolean
}

function vecToThree(v: { x: number; y: number; z: number }) {
  return [v.x, v.y, v.z] as [number, number, number]
}

export function TrajectoryVisual({ points, color, time, showForces }: Props) {
  const linePoints = useMemo(
    () => points.map((p) => vecToThree(p.position)),
    [points],
  )

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
      <Line points={linePoints} color={color} lineWidth={2} />
      {sample && (
        <Sphere args={[0.067, 24, 24]} position={vecToThree(sample.position)}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
        </Sphere>
      )}
      {forceArrows?.gravity && <primitive object={forceArrows.gravity} />}
      {forceArrows?.drag && <primitive object={forceArrows.drag} />}
      {forceArrows?.magnus && <primitive object={forceArrows.magnus} />}
    </group>
  )
}
