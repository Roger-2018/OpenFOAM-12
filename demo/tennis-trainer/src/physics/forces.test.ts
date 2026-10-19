import { describe, expect, it } from 'vitest'
import { computeForces } from './forces'
import { v3 } from './vec3'

describe('computeForces', () => {
  it('applies gravity downward when enabled', () => {
    const f = computeForces(
      { position: v3(0, 1, 0), velocity: v3(0, 0, 0), omega: v3(0, 0, 0) },
      { enableGravity: true, enableDrag: false, enableMagnus: false },
    )
    expect(f.gravity.y).toBeLessThan(0)
    expect(f.drag.x).toBe(0)
    expect(f.magnus.x).toBe(0)
  })

  it('applies drag opposite to velocity', () => {
    const f = computeForces(
      {
        position: v3(0, 1, 0),
        velocity: v3(0, 0, 40),
        omega: v3(0, 0, 0),
      },
      { enableGravity: false, enableDrag: true, enableMagnus: false },
    )
    expect(f.drag.z).toBeLessThan(0)
    expect(f.magnus.z).toBe(0)
  })

  it('applies magnus force perpendicular to spin and velocity', () => {
    const f = computeForces(
      {
        position: v3(0, 1, 0),
        velocity: v3(0, 0, 30),
        omega: v3(-200, 0, 0),
      },
      { enableGravity: false, enableDrag: false, enableMagnus: true },
    )
    expect(Math.abs(f.magnus.y)).toBeGreaterThan(0)
  })
})
