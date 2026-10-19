import { BALL_RADIUS_M } from '../physics/constants'

/** 5 岁儿童在远景 3D 场地上仍能清楚看到球体。 */
export const KID_FRIENDLY_VISUAL_SCALE = 2.35

export const TENNIS_BALL_COLORS = {
  felt: '#d4f106',
  feltDark: '#9cb304',
  seam: '#ffffff',
  glow: '#fff9c4',
} as const

export function visualBallRadius(kidFriendly: boolean): number {
  return kidFriendly
    ? BALL_RADIUS_M * KID_FRIENDLY_VISUAL_SCALE
    : BALL_RADIUS_M
}
