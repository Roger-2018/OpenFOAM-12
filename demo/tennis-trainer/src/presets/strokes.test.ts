import { describe, expect, it } from 'vitest'
import { STROKE_PRESETS, buildRawInitialState } from './strokes'

describe('stroke presets', () => {
  it('exposes four beginner stroke types', () => {
    expect(Object.keys(STROKE_PRESETS).sort()).toEqual(
      ['flat', 'slice', 'sideSpin', 'topspin'].sort(),
    )
  })

  it('scales speed with power factor', () => {
    const low = buildRawInitialState('flat', { power: 0.5, brush: 0.5 })
    const high = buildRawInitialState('flat', { power: 1, brush: 0.5 })
    const lowSpeed = Math.hypot(
      low.velocity.x,
      low.velocity.y,
      low.velocity.z,
    )
    const highSpeed = Math.hypot(
      high.velocity.x,
      high.velocity.y,
      high.velocity.z,
    )
    expect(highSpeed).toBeGreaterThan(lowSpeed)
  })

  it('increases spin magnitude with brush for topspin', () => {
    const low = buildRawInitialState('topspin', { power: 0.8, brush: 0.2 })
    const high = buildRawInitialState('topspin', { power: 0.8, brush: 1 })
    const spin = (o: typeof low.omega) =>
      Math.hypot(o.x, o.y, o.z)
    expect(spin(high.omega)).toBeGreaterThan(spin(low.omega))
  })
})
