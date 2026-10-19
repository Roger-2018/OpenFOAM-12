import { analyticLiftCoefficient, getAeroCoefficients } from './aeroProvider'
import {
  AIR_DENSITY,
  BALL_CROSS_SECTION,
  BALL_MASS_KG,
  GRAVITY,
} from './constants'
import type { BallState, ForceBreakdown, SimOptions } from './types'
import { add, cross, length, normalize, scale, v3 } from './vec3'

const defaultOpts = {
  enableGravity: true,
  enableDrag: true,
  enableMagnus: true,
}

export function liftCoefficient(spinParameter: number): number {
  return analyticLiftCoefficient(Math.min(spinParameter, 2.5))
}

export function computeForces(
  state: BallState,
  options: Pick<
    SimOptions,
    'enableGravity' | 'enableDrag' | 'enableMagnus'
  > = {},
): ForceBreakdown {
  const opts = { ...defaultOpts, ...options }
  const gravity = opts.enableGravity
    ? v3(0, -BALL_MASS_KG * GRAVITY, 0)
    : v3(0, 0, 0)

  const speed = length(state.velocity)
  let drag = v3(0, 0, 0)
  const spinMag = length(state.omega)
  const { cd, cl } = getAeroCoefficients(speed, spinMag)

  if (opts.enableDrag && speed > 1e-6) {
    const magnitude = 0.5 * AIR_DENSITY * cd * BALL_CROSS_SECTION * speed
    drag = scale(state.velocity, -magnitude)
  }

  let magnus = v3(0, 0, 0)
  if (opts.enableMagnus && speed > 1e-6) {
    if (spinMag > 1e-6) {
      const crossDir = cross(state.omega, state.velocity)
      const crossLen = length(crossDir)
      if (crossLen > 1e-9) {
        const forceMag =
          0.5 * AIR_DENSITY * cl * BALL_CROSS_SECTION * speed * speed
        magnus = scale(normalize(crossDir), forceMag)
      }
    }
  }

  return {
    gravity,
    drag,
    magnus,
    total: add(add(gravity, drag), magnus),
  }
}

export function acceleration(state: BallState, options: SimOptions): ForceBreakdown {
  const forces = computeForces(state, options)
  return {
    gravity: scale(forces.gravity, 1 / BALL_MASS_KG),
    drag: scale(forces.drag, 1 / BALL_MASS_KG),
    magnus: scale(forces.magnus, 1 / BALL_MASS_KG),
    total: scale(forces.total, 1 / BALL_MASS_KG),
  }
}
