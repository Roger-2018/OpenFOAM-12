import { BALL_RADIUS_M } from './constants'
import type { BallState } from './types'
import { scale, v3 } from './vec3'

const VERTICAL_RESTITUTION = 0.68
const TANGENTIAL_DAMPING = 0.38
const SPIN_TO_FORWARD = 0.012
const SPIN_TO_SIDE = 0.006
const SPIN_DECAY = 0.9

export function detectGroundContact(state: BallState): boolean {
  return (
    state.position.y <= BALL_RADIUS_M + 0.004 && state.velocity.y < 0
  )
}

/**
 * 简化硬地弹起：上旋（+ωx）一弹后更往前窜，便于演示「二跳」。
 */
export function applyGroundBounce(state: BallState): BallState {
  const { omega, velocity } = state
  const y = Math.max(state.position.y, BALL_RADIUS_M)

  const vy =
    velocity.y < 0 ? -velocity.y * VERTICAL_RESTITUTION : velocity.y
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
