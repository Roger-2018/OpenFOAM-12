import { describe, expect, it } from 'vitest'
import { BALL_RADIUS_M } from './constants'
import {
  applyGroundBounce,
  detectGroundContact,
  spinVerticalKickFactor,
} from './bounce'
import { v3 } from './vec3'

describe('ground bounce', () => {
  it('detects contact when center is near ground and moving down', () => {
    expect(
      detectGroundContact({
        position: v3(0, BALL_RADIUS_M - 0.002, 5),
        velocity: v3(0, -3, 10),
        omega: v3(0, 0, 0),
      }),
    ).toBe(true)
  })

  it('reflects vertical velocity with restitution', () => {
    const next = applyGroundBounce({
      position: v3(0, 0.01, 4),
      velocity: v3(0, -8, 12),
      omega: v3(0, 0, 0),
    })
    expect(next.position.y).toBeGreaterThanOrEqual(BALL_RADIUS_M - 0.001)
    expect(next.velocity.y).toBeGreaterThan(0)
    expect(next.velocity.y).toBeLessThan(8)
  })

  it('topspin increases vertical kick factor more than flat spin', () => {
    expect(spinVerticalKickFactor(420)).toBeGreaterThan(spinVerticalKickFactor(20) + 0.25)
  })

  it('topspin bounce kicks forward more than flat bounce', () => {
    const base = {
      position: v3(0, 0.01, 6),
      velocity: v3(0, -7, 10),
      omega: v3(0, 0, 0),
    }
    const flat = applyGroundBounce(base)
    const topspin = applyGroundBounce({ ...base, omega: v3(260, 0, 0) })
    expect(topspin.velocity.z).toBeGreaterThan(flat.velocity.z)
    expect(topspin.velocity.y).toBeGreaterThan(flat.velocity.y * 1.4)
  })
})
