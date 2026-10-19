import { describe, expect, it } from 'vitest'
import { flightSummary, integrateTrajectory } from '../physics/integrate'
import { buildInitialState } from './strokes'

const SERVE_SIM = {
  enableBounce: true,
  maxBounces: 2,
  stopAtCourtBounds: true,
  courtBoundsFirstFlightOnly: true,
} as const

/** 一弹后弹起弧线的最高点（Kick 最直观）。 */
function firstReboundApex(points: ReturnType<typeof integrateTrajectory>) {
  const summary = flightSummary(points)
  const t1 = summary.firstLanding?.t
  if (t1 == null) return 0
  const tEnd = summary.secondLanding?.t ?? points[points.length - 1].t
  return Math.max(
    ...points
      .filter((p) => p.t > t1 && p.t <= tEnd)
      .map((p) => p.position.y),
  )
}

function secondReboundApex(points: ReturnType<typeof integrateTrajectory>) {
  const summary = flightSummary(points)
  const t2 = summary.secondLanding?.t
  if (t2 == null) return 0
  return Math.max(
    ...points
      .filter((p) => p.t > t2 && p.t <= t2 + 1.2)
      .map((p) => p.position.y),
  )
}

describe('serve bounce contrast', () => {
  it('topspin serve rebounds much higher than flat after first landing', () => {
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

    const flatRebound = firstReboundApex(flat)
    const topRebound = firstReboundApex(topspin)
    expect(topRebound).toBeGreaterThan(flatRebound + 0.8)
    expect(topRebound).toBeGreaterThan(2.5)
  })

  it('topspin second bounce apex exceeds flat when two contacts occur', () => {
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
    if (flightSummary(flat).bounces.length < 2) return
    const flat2 = secondReboundApex(flat)
    const top2 = secondReboundApex(topspin)
    expect(top2).toBeGreaterThan(flat2 + 0.25)
  })
})
