import { describe, expect, it } from 'vitest'
import { integrateTrajectory } from '../physics/integrate'
import { buildInitialState } from './strokes'

const SERVE_SIM = {
  enableBounce: true,
  maxBounces: 2,
  stopAtCourtBounds: true,
  courtBoundsFirstFlightOnly: true,
} as const

function maxHeight(points: ReturnType<typeof integrateTrajectory>) {
  return Math.max(...points.map((p) => p.position.y))
}

describe('serve apex realism', () => {
  it('topspin serve peak stays in a realistic range', () => {
    const tuning = { power: 0.82, brush: 0.78 }
    const flat = integrateTrajectory(
      buildInitialState('flat', tuning, 'serve'),
      6,
      SERVE_SIM,
    )
    const topspin = integrateTrajectory(
      buildInitialState('topspin', tuning, 'serve'),
      6,
      SERVE_SIM,
    )
    const flatMax = maxHeight(flat)
    const topMax = maxHeight(topspin)
    expect(topMax).toBeLessThan(5.2)
    expect(topMax).toBeGreaterThan(flatMax + 0.15)
  })
})
