import {
  type FitScenario,
  isLandingOkForScenario,
  RALLY_LIMITS,
  SERVE_DEUCE_BOX,
} from '../court/bounds'
import { integrateTrajectory } from '../physics/integrate'
import type { BallState } from '../physics/types'
import { scale, v3 } from '../physics/vec3'

function scaleForFit(
  state: BallState,
  factor: number,
  scenario: FitScenario,
): BallState {
  if (scenario === 'serve') {
    return {
      position: state.position,
      velocity: scale(state.velocity, factor),
      omega: state.omega,
    }
  }
  return {
    position: state.position,
    velocity: scale(state.velocity, factor),
    omega: scale(state.omega, factor),
  }
}

function landingPosition(state: BallState) {
  const points = integrateTrajectory(state, 3.8)
  return points[points.length - 1].position
}

function trimLateral(state: BallState, scenario: FitScenario): BallState {
  let trial = state
  const xLimit =
    scenario === 'serve' ? SERVE_DEUCE_BOX.xMax : RALLY_LIMITS.xMax

  for (let j = 0; j < 8; j++) {
    const { x, z } = landingPosition(trial)
    if (isLandingOkForScenario(scenario, x, z)) return trial
    if (scenario === 'serve' && x < SERVE_DEUCE_BOX.xMin) {
      trial = {
        ...trial,
        velocity: v3(
          trial.velocity.x * 0.85 + 0.8,
          trial.velocity.y,
          trial.velocity.z,
        ),
      }
      continue
    }
    if (Math.abs(x) <= xLimit) return trial
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

function limitsForScenario(scenario: FitScenario) {
  if (scenario === 'serve') {
    return {
      zMax: SERVE_DEUCE_BOX.zMax,
      zMin: SERVE_DEUCE_BOX.zMin,
      xMax: SERVE_DEUCE_BOX.xMax,
      xMin: SERVE_DEUCE_BOX.xMin,
    }
  }
  return {
    zMax: RALLY_LIMITS.zMax,
    zMin: RALLY_LIMITS.zMin,
    xMax: RALLY_LIMITS.xMax,
    xMin: 0,
  }
}

/**
 * 按场景校准出球，使第一落点落在单打有效区或发球区内。
 */
export function fitInitialStateToCourt(
  initial: BallState,
  scenario: FitScenario = 'rally',
): BallState {
  let factor = scenario === 'serve' ? 1.05 : 1.08
  let fallback = scaleForFit(initial, 0.52, scenario)
  const limits = limitsForScenario(scenario)

  for (let i = 0; i < 44; i++) {
    if (factor < 0.34) break
    let trial = trimLateral(scaleForFit(initial, factor, scenario), scenario)
    const { x, z } = landingPosition(trial)

    if (isLandingOkForScenario(scenario, x, z)) {
      return trial
    }

    fallback = trial
    const tooLong = z > limits.zMax
    const tooShort = z < limits.zMin
    const tooWide =
      scenario === 'serve'
        ? x > limits.xMax || x < limits.xMin
        : Math.abs(x) > limits.xMax

    if (tooLong || tooWide) {
      factor *= 0.92
    } else if (tooShort) {
      factor *= 1.05
    } else {
      factor *= 0.96
    }
  }

  return fallback
}
