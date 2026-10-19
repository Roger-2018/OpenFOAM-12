import { describe, expect, it } from 'vitest'
import {
  RALLY_LIMITS,
  SERVE_DEUCE_BOX,
  START_Z,
} from '../court/bounds'
import { COURT } from '../court/dimensions'
import { integrateTrajectory } from '../physics/integrate'
import { buildInitialState, buildRawInitialState } from './strokes'
import { fitInitialStateToCourt } from './fitToCourt'

const strokes = ['flat', 'topspin', 'slice', 'sideSpin'] as const

describe('fitInitialStateToCourt', () => {
  it.each(strokes)('rally %s lands deep but in singles', (stroke) => {
    const fitted = buildInitialState(stroke, { power: 1, brush: 1 }, 'rally')
    const end = integrateTrajectory(fitted, 3.8).at(-1)!
    expect(end.position.z).toBeLessThanOrEqual(RALLY_LIMITS.zMax)
    expect(end.position.z).toBeGreaterThanOrEqual(RALLY_LIMITS.zMin)
    expect(Math.abs(end.position.x)).toBeLessThanOrEqual(RALLY_LIMITS.xMax)
  })

  it.each(strokes)('serve %s starts at baseline and lands in deuce box', (stroke) => {
    const raw = buildRawInitialState(stroke, { power: 0.85, brush: 0.65 }, 'serve')
    expect(raw.position.z).toBeGreaterThanOrEqual(-COURT.halfLength)
    expect(raw.position.z).toBeLessThanOrEqual(-COURT.halfLength + 0.2)

    const fitted = fitInitialStateToCourt(raw, 'serve')
    const end = integrateTrajectory(fitted, 3.8).at(-1)!
    expect(end.position.x).toBeGreaterThanOrEqual(SERVE_DEUCE_BOX.xMin)
    expect(end.position.x).toBeLessThanOrEqual(SERVE_DEUCE_BOX.xMax)
    expect(end.position.z).toBeGreaterThanOrEqual(SERVE_DEUCE_BOX.zMin)
    expect(end.position.z).toBeLessThanOrEqual(SERVE_DEUCE_BOX.zMax)
  })

  it('serve contact is behind rally contact (closer to baseline)', () => {
    const rally = buildRawInitialState('flat', { power: 0.8, brush: 0.7 }, 'rally')
    const serve = buildRawInitialState('flat', { power: 0.8, brush: 0.7 }, 'serve')
    expect(serve.position.z).toBeLessThan(rally.position.z)
    expect(serve.position.z).toBeCloseTo(START_Z.serve, 2)
  })
})
