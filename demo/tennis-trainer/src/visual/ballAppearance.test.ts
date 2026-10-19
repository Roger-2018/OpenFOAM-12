import { describe, expect, it } from 'vitest'
import { BALL_RADIUS_M } from '../physics/constants'
import {
  KID_FRIENDLY_VISUAL_SCALE,
  visualBallRadius,
} from './ballAppearance'

describe('ballAppearance', () => {
  it('renders kid-friendly ball larger than real ITF size', () => {
    expect(KID_FRIENDLY_VISUAL_SCALE).toBeGreaterThan(1.5)
    expect(visualBallRadius(true)).toBeGreaterThan(BALL_RADIUS_M * 1.5)
  })

  it('uses real size when kid mode is off', () => {
    expect(visualBallRadius(false)).toBeCloseTo(BALL_RADIUS_M, 4)
  })
})
