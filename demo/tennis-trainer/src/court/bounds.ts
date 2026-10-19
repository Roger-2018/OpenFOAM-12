import { COURT } from './dimensions'

/** 相持球：落点在单打区内，可较深、近底线。 */
export const RALLY_LIMITS = {
  zMax: COURT.halfLength - 0.28,
  zMin: 1.0,
  xMax: COURT.singlesHalfWidth - 0.22,
} as const

/** 一发/二发演示：默认瞄向对手占先区（右侧发球区，+x）。 */
export const SERVE_DEUCE_BOX = {
  xMin: 0.35,
  xMax: COURT.singlesHalfWidth - 0.12,
  zMin: 1.6,
  zMax: COURT.serviceLineFromNet - 0.18,
} as const

/** 击球站位：贴近己方底线（相持略前，发球在底线触球）。 */
export const START_Z = {
  rally: -COURT.halfLength + 0.55,
  serve: -COURT.halfLength + 0.12,
} as const

export type FitScenario = 'rally' | 'serve'

export function isRallyLandingOk(x: number, z: number): boolean {
  return (
    Math.abs(x) <= RALLY_LIMITS.xMax &&
    z >= RALLY_LIMITS.zMin &&
    z <= RALLY_LIMITS.zMax
  )
}

export function isServeLandingOk(x: number, z: number): boolean {
  return (
    x >= SERVE_DEUCE_BOX.xMin &&
    x <= SERVE_DEUCE_BOX.xMax &&
    z >= SERVE_DEUCE_BOX.zMin &&
    z <= SERVE_DEUCE_BOX.zMax
  )
}

export function isLandingOkForScenario(
  scenario: FitScenario,
  x: number,
  z: number,
): boolean {
  return scenario === 'serve'
    ? isServeLandingOk(x, z)
    : isRallyLandingOk(x, z)
}

export function isPositionInSinglesCourt(x: number, z: number): boolean {
  return (
    Math.abs(x) <= COURT.singlesHalfWidth &&
    z >= -COURT.halfLength &&
    z <= COURT.halfLength
  )
}
