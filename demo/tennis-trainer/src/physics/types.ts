export type Vec3 = { x: number; y: number; z: number }

export type BallState = {
  position: Vec3
  velocity: Vec3
  omega: Vec3
}

export type TrajectoryPoint = BallState & {
  t: number
  /** 0=首段飞行，1=一弹后，2=二弹后 */
  flightSegment?: number
}

export type ForceBreakdown = {
  gravity: Vec3
  drag: Vec3
  magnus: Vec3
  total: Vec3
}

export type SimOptions = {
  dt?: number
  enableGravity?: boolean
  enableDrag?: boolean
  enableMagnus?: boolean
  maxPoints?: number
  /** Stop integration when ball falls below y=0 (default true). */
  stopAtGround?: boolean
  /** Stop when ball crosses singles baseline/longitudinal bounds (default false). */
  stopAtCourtBounds?: boolean
  /** 仅首段飞行限制界内（发球一弹后允许演示二跳弧线） */
  courtBoundsFirstFlightOnly?: boolean
  /** 落地弹起（演示二跳） */
  enableBounce?: boolean
  /** 最多弹起次数（默认 2：一弹 + 二弹） */
  maxBounces?: number
}
