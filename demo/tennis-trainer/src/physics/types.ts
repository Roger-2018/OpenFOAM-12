export type Vec3 = { x: number; y: number; z: number }

export type BallState = {
  position: Vec3
  velocity: Vec3
  omega: Vec3
}

export type TrajectoryPoint = BallState & { t: number }

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
}
