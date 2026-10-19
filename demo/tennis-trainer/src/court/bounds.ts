import { COURT } from './dimensions'

/** Margin inside singles lines (m) — demo落点留足余量，避免贴底线或飞出界。 */
export const COURT_INSET = {
  length: 1.05,
  width: 0.55,
} as const

export const COURT_LIMITS = {
  zMax: COURT.halfLength - COURT_INSET.length,
  zMin: 0.8,
  xMax: COURT.singlesHalfWidth - COURT_INSET.width,
} as const

export function isLandingInSinglesCourt(x: number, z: number): boolean {
  return (
    Math.abs(x) <= COURT_LIMITS.xMax &&
    z >= COURT_LIMITS.zMin &&
    z <= COURT_LIMITS.zMax
  )
}

export function isPositionInSinglesCourt(x: number, z: number): boolean {
  return (
    Math.abs(x) <= COURT.singlesHalfWidth &&
    z >= -COURT.halfLength &&
    z <= COURT.halfLength
  )
}
