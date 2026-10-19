import { describe, expect, it } from 'vitest'
import { pickCoachTip } from './coachTip'

describe('pickCoachTip', () => {
  it('explains topspin first bounce in kid language', () => {
    const tip = pickCoachTip({
      stroke: 'topspin',
      playMode: 'rally',
      time: 1.2,
      enableBounce: true,
      firstBounceT: 1.15,
      secondBounceT: 2.4,
    })
    expect(tip.title).toContain('一弹')
    expect(tip.body).toMatch(/转|滚|窜/)
  })

  it('shows flight tip before first bounce', () => {
    const tip = pickCoachTip({
      stroke: 'topspin',
      playMode: 'rally',
      time: 0.4,
      enableBounce: true,
      firstBounceT: 1.15,
      secondBounceT: null,
    })
    expect(tip.kind).toBe('flight')
  })

  it('falls back when bounce is disabled', () => {
    const tip = pickCoachTip({
      stroke: 'flat',
      playMode: 'rally',
      time: 0.5,
      enableBounce: false,
      firstBounceT: null,
      secondBounceT: null,
    })
    expect(tip.kind).toBe('intro')
  })
})
