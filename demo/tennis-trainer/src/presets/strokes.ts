import type { BallState } from '../physics/types'
import { v3 } from '../physics/vec3'
import { fitInitialStateToCourt } from './fitToCourt'

export type StrokeId = 'flat' | 'topspin' | 'slice' | 'sideSpin'

export type StrokeTuning = {
  power: number
  brush: number
}

export const STROKE_PRESETS: Record<
  StrokeId,
  { label: string; description: string; color: string }
> = {
  flat: {
    label: '平击',
    description: '几乎不刷球，轨迹较直、靠速度压线。',
    color: '#f97316',
  },
  topspin: {
    label: '上旋',
    description: '拍面向上刷，球急坠、过网后仍往前钻。',
    color: '#22c55e',
  },
  slice: {
    label: '切削',
    description: '拍面向下切，弧线偏飘、落点常较浅。',
    color: '#38bdf8',
  },
  sideSpin: {
    label: '侧旋',
    description: '横向刷球，飞行中会向左或向右弯。',
    color: '#a855f7',
  },
}

const BASE_SPEED = 21
const BASE_HEIGHT = 1.25
const BASE_Z = -9.5

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

/** Raw launch from UI tuning (may land out until court fit is applied). */
export function buildRawInitialState(
  stroke: StrokeId,
  tuning: StrokeTuning,
): BallState {
  const power = clamp01(tuning.power)
  const brush = clamp01(tuning.brush)
  const speed = BASE_SPEED * (0.55 + 0.55 * power)
  const launchAngle = (12 + 8 * brush) * (Math.PI / 180)
  const vy = speed * Math.sin(launchAngle) + 2 * brush
  const vz = speed * Math.cos(launchAngle)

  let omega = v3(0, 0, 0)
  switch (stroke) {
    case 'flat':
      omega = v3(20 * brush, 0, 15 * brush)
      break
    case 'topspin':
      omega = v3(80 + 320 * brush, 0, 0)
      break
    case 'slice':
      omega = v3(-(60 + 280 * brush), 0, 0)
      break
    case 'sideSpin':
      omega = v3(40 * brush, 180 + 240 * brush, 0)
      break
  }

  return {
    position: v3(0, BASE_HEIGHT, BASE_Z),
    velocity: v3(0, vy, vz),
    omega,
  }
}

export function buildInitialState(
  stroke: StrokeId,
  tuning: StrokeTuning,
): BallState {
  return fitInitialStateToCourt(buildRawInitialState(stroke, tuning))
}
