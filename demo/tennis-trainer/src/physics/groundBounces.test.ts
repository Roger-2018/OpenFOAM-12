import { describe, expect, it } from 'vitest'
import { BALL_RADIUS_M } from './constants'
import { integrateTrajectory } from './integrate'
import { listGroundBounces } from './groundBounces'
import { buildInitialState } from '../presets/strokes'

function countNearGroundLocalMinima(
  points: ReturnType<typeof integrateTrajectory>,
): number {
  let count = 0
  for (let i = 1; i < points.length - 1; i++) {
    const y = points[i].position.y
    if (y > BALL_RADIUS_M + 0.02) continue
    if (y <= points[i - 1].position.y && y <= points[i + 1].position.y) {
      count++
    }
  }
  return count
}

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

  it('serve compare mode shows at most two ground touch arcs on the line', () => {
    const tuning = { power: 0.78, brush: 0.72 }
    for (const stroke of ['flat', 'topspin'] as const) {
      const pts = integrateTrajectory(
        buildInitialState(stroke, tuning, 'serve'),
        4.6,
        {
          enableBounce: true,
          maxBounces: 2,
          stopAtCourtBounds: true,
          courtBoundsFirstFlightOnly: true,
        },
      )
      expect(countNearGroundLocalMinima(pts)).toBeLessThanOrEqual(2)
    }
  })
})
