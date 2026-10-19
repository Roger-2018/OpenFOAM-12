import { describe, expect, it } from 'vitest'
import { integrateTrajectory } from './integrate'
import { v3 } from './vec3'

describe('integrateTrajectory', () => {
  it('follows ballistic path when only gravity acts', () => {
    const v0 = 20
    const points = integrateTrajectory(
      {
        position: v3(0, 0, 0),
        velocity: v3(0, 0, v0),
        omega: v3(0, 0, 0),
      },
      2,
      {
        dt: 0.002,
        enableGravity: true,
        enableDrag: false,
        enableMagnus: false,
        stopAtGround: false,
      },
    )
    const last = points[points.length - 1]
    expect(last.t).toBeCloseTo(2, 2)
    expect(last.position.z).toBeCloseTo(v0 * 2, 1)
    expect(last.position.y).toBeCloseTo(-0.5 * 9.81 * 4, 0)
  })

  it('shortens range when drag is enabled', () => {
    const initial = {
      position: v3(0, 1, -5),
      velocity: v3(0, 2, 35),
      omega: v3(0, 0, 0),
    }
    const noDrag = integrateTrajectory(initial, 1.2, {
      enableGravity: true,
      enableDrag: false,
      enableMagnus: false,
    })
    const withDrag = integrateTrajectory(initial, 1.2, {
      enableGravity: true,
      enableDrag: true,
      enableMagnus: false,
    })
    const zNo = noDrag[noDrag.length - 1].position.z
    const zDrag = withDrag[withDrag.length - 1].position.z
    expect(zDrag).toBeLessThan(zNo)
  })

  it('topspin reaches lower apex than flat for same launch', () => {
    const launch = {
      position: v3(0, 1.2, -8),
      velocity: v3(0, 8, 32),
      omega: v3(0, 0, 0),
    }
    const flat = integrateTrajectory(launch, 1.5, {
      enableGravity: true,
      enableDrag: true,
      enableMagnus: true,
    })
    const topspin = integrateTrajectory(
      { ...launch, omega: v3(220, 0, 0) },
      1.5,
      { enableGravity: true, enableDrag: true, enableMagnus: true },
    )
    const maxY = (pts: typeof flat) =>
      Math.max(...pts.map((p) => p.position.y))
    expect(maxY(topspin)).toBeLessThan(maxY(flat))
  })
})
