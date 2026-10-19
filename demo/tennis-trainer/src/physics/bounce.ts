import { BALL_RADIUS_M } from './constants'
import type { BallState } from './types'
import { scale, v3 } from './vec3'

const BASE_VERTICAL_RESTITUTION = 0.62
const TANGENTIAL_DAMPING = 0.36
const SPIN_TO_FORWARD = 0.014
const SPIN_TO_SIDE = 0.006
const SPIN_DECAY = 0.88

/** 上旋 (+ωx) 落地时「挑起来」；下旋/切削压低弹起。 */
export function spinVerticalKickFactor(omegaX: number): number {
  if (omegaX >= 0) {
    return 1 + Math.min(1.25, omegaX / 180)
  }
  return Math.max(0.45, 1 + omegaX / 350)
}

export function detectGroundContact(state: BallState): boolean {
  return (
    state.position.y <= BALL_RADIUS_M + 0.004 && state.velocity.y < 0
  )
}

/**
 * 硬地弹起：上旋一弹/二弹明显更高、更往前；平击更贴地。
 */
export function applyGroundBounce(state: BallState): BallState {
  const { omega, velocity } = state
  const y = Math.max(state.position.y, BALL_RADIUS_M)
  const kickUp = spinVerticalKickFactor(omega.x)

  const inboundVy = velocity.y < 0 ? -velocity.y : 0
  const vy =
    velocity.y < 0
      ? inboundVy * BASE_VERTICAL_RESTITUTION * kickUp
      : velocity.y

  const vz =
    velocity.z * (1 - TANGENTIAL_DAMPING) +
    SPIN_TO_FORWARD * omega.x * BALL_RADIUS_M
  const vx =
    velocity.x * (1 - TANGENTIAL_DAMPING) +
    SPIN_TO_SIDE * omega.y * BALL_RADIUS_M

  return {
    position: v3(state.position.x, y, state.position.z),
    velocity: v3(vx, vy, vz),
    omega: scale(omega, SPIN_DECAY),
  }
}
