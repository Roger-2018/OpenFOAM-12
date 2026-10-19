import { describe, expect, it } from 'vitest'
import { advanceSimulationTime } from './playbackRate'

describe('advanceSimulationTime', () => {
  it('runs at half speed when rate is 0.5', () => {
    expect(advanceSimulationTime(0, 1, 0.5, 10)).toBe(0.5)
  })

  it('loops to zero after duration', () => {
    expect(advanceSimulationTime(9.9, 0.5, 1, 10)).toBe(0)
  })
})
