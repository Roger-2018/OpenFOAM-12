import { describe, expect, it } from 'vitest'
import { integrateTrajectory } from './integrate'
import { v3 } from './vec3'

describe('integrateTrajectory with bounce', () => {
  it('records two separate ground contacts before stopping', () => {
    const points = integrateTrajectory(
      {
        position: v3(0, 2, -2),
        velocity: v3(0, 2, 14),
        omega: v3(180, 0, 0),
      },
      5,
      { enableBounce: true, maxBounces: 2, stopAtGround: false },
    )

    let contacts = 0
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const cur = points[i]
      if (prev.velocity.y < 0 && cur.velocity.y > 0 && cur.position.y < 0.2) {
        contacts++
      }
    }
    expect(contacts).toBeGreaterThanOrEqual(2)
    expect(points.length).toBeGreaterThan(40)
  })
})
