import { COURT_LIMITS, isLandingInSinglesCourt } from '../court/bounds'
import { integrateTrajectory } from '../physics/integrate'
import type { BallState } from '../physics/types'
import { scale, v3 } from '../physics/vec3'

function scaleVelocity(state: BallState, factor: number): BallState {
  return {
    position: state.position,
    velocity: scale(state.velocity, factor),
    omega: scale(state.omega, factor),
  }
}

function landingPosition(state: BallState) {
  const points = integrateTrajectory(state, 3.5)
  return points[points.length - 1].position
}

function landingOk(x: number, z: number) {
  return isLandingInSinglesCourt(x, z)
}

function trimLateral(state: BallState): BallState {
  let trial = state
  for (let j = 0; j < 8; j++) {
    const { x, z } = landingPosition(trial)
    if (landingOk(x, z)) return trial
    if (Math.abs(x) <= COURT_LIMITS.xMax) return trial
    trial = {
      ...trial,
      velocity: v3(
        trial.velocity.x * 0.78,
        trial.velocity.y,
        trial.velocity.z,
      ),
      omega: v3(trial.omega.x, trial.omega.y * 0.86, trial.omega.z),
    }
  }
  return trial
}

/**
 * Scales launch speed/spin so first bounce lands in the opponent singles court (demo teaching).
 */
export function fitInitialStateToCourt(initial: BallState): BallState {
  let factor = 1.08
  let fallback = scaleVelocity(initial, 0.55)

  for (let i = 0; i < 40; i++) {
    if (factor < 0.38) break
    let trial = trimLateral(scaleVelocity(initial, factor))
    const { x, z } = landingPosition(trial)

    if (landingOk(x, z)) {
      return trial
    }

    fallback = trial
    if (z > COURT_LIMITS.zMax || Math.abs(x) > COURT_LIMITS.xMax) {
      factor *= 0.93
    } else if (z < COURT_LIMITS.zMin) {
      factor *= 1.04
    } else {
      factor *= 0.96
    }
  }

  return fallback
}
