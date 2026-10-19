import { describe, expect, it } from 'vitest'
import { integrateTrajectory } from './integrate'
import { listGroundBounces } from './groundBounces'
import { buildInitialState } from '../presets/strokes'

describe('listGroundBounces', () => {
  it('never lists more than two ground bounces', () => {
    const pts = integrateTrajectory(
      buildInitialState('topspin', { power: 0.85, brush: 0.8 }, 'serve'),
      6,
      {
        enableBounce: true,
        maxBounces: 2,
        stopAtCourtBounds: true,
        courtBoundsFirstFlightOnly: true,
      },
    )
    const marks = listGroundBounces(pts)
    expect(marks.length).toBeLessThanOrEqual(2)
    if (marks.length === 2) {
      expect(marks[0].index).toBe(1)
      expect(marks[1].index).toBe(2)
    }
  })
})
