import type { TrajectoryPoint } from './types'

export type GroundBounceMark = {
  t: number
  x: number
  z: number
  index: 1 | 2
}

const MAX_GROUND_BOUNCES = 2

/** 从轨迹中提取一弹/二弹落点（最多 2 个，不用速度启发式避免「三跳」）。 */
export function listGroundBounces(points: TrajectoryPoint[]): GroundBounceMark[] {
  const tagged = points
    .filter(
      (p): p is TrajectoryPoint & { groundBounceIndex: 1 | 2 } =>
        p.groundBounceIndex === 1 || p.groundBounceIndex === 2,
    )
    .map((p) => ({
      t: p.t,
      x: p.position.x,
      z: p.position.z,
      index: p.groundBounceIndex,
    }))

  if (tagged.length > 0) {
    return tagged.slice(0, MAX_GROUND_BOUNCES)
  }

  return []
}
