import { describe, expect, it } from 'vitest'
import { COURT_LIMITS } from '../court/bounds'
import { COURT } from '../court/dimensions'
import { integrateTrajectory } from '../physics/integrate'
import { buildInitialState, buildRawInitialState } from './strokes'
import { fitInitialStateToCourt } from './fitToCourt'

const strokes = ['flat', 'topspin', 'slice', 'sideSpin'] as const

describe('fitInitialStateToCourt', () => {
  it.each(strokes)('keeps %s landing inside demo bounds on max sliders', (stroke) => {
    const fitted = fitInitialStateToCourt(
      buildRawInitialState(stroke, { power: 1, brush: 1 }),
    )
    const end = integrateTrajectory(fitted, 3.5).at(-1)!
    expect(end.position.z).toBeLessThanOrEqual(COURT_LIMITS.zMax)
    expect(end.position.z).toBeGreaterThanOrEqual(COURT_LIMITS.zMin)
    expect(Math.abs(end.position.x)).toBeLessThanOrEqual(COURT_LIMITS.xMax)
    expect(end.position.z).toBeLessThan(COURT.halfLength)
  })

  it.each(strokes)('buildInitialState stays in bounds at default tuning', (stroke) => {
    const end = integrateTrajectory(
      buildInitialState(stroke, { power: 0.78, brush: 0.72 }),
      3.5,
    ).at(-1)!
    expect(end.position.z).toBeLessThanOrEqual(COURT_LIMITS.zMax)
    expect(Math.abs(end.position.x)).toBeLessThanOrEqual(COURT_LIMITS.xMax)
  })
})
