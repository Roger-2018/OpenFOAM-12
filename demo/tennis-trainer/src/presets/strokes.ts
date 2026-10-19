import { COURT } from '../court/dimensions'
import { START_Z } from '../court/bounds'
import type { BallState } from '../physics/types'
import { v3 } from '../physics/vec3'
import { fitInitialStateToCourt } from './fitToCourt'

export type StrokeId = 'flat' | 'topspin' | 'slice' | 'sideSpin'
export type PlayMode = 'rally' | 'serve'

export type StrokeTuning = {
  power: number
  brush: number
}

export const PLAY_MODE_LABELS: Record<
  PlayMode,
  { label: string; description: string }
> = {
  rally: {
    label: '底线相持',
    description: '在己方底线附近击球，落点可较深，贴近对方底线。',
  },
  serve: {
    label: '底线发球',
    description: '在底线后上方触球，第一落点进入对方发球区（占先区演示）。',
  },
}

export const STROKE_PRESETS: Record<
  StrokeId,
  { label: string; description: string; color: string; serveLabel: string }
> = {
  flat: {
    label: '平击',
    serveLabel: '平击发球',
    description: '几乎不刷球，轨迹较直、靠速度压线。',
    color: '#f97316',
  },
  topspin: {
    label: '上旋',
    serveLabel: '上旋发球',
    description: '拍面向上刷，球急坠、过网后仍往前钻。',
    color: '#22c55e',
  },
  slice: {
    label: '切削',
    serveLabel: '切削发球',
    description: '拍面向下切，弧线偏飘、落点常较浅。',
    color: '#38bdf8',
  },
  sideSpin: {
    label: '侧旋',
    serveLabel: '侧旋发球',
    description: '横向刷球，飞行中会向左或向右弯。',
    color: '#a855f7',
  },
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function deg(n: number) {
  return n * (Math.PI / 180)
}

/** Raw launch from UI tuning (may land out until court fit is applied). */
export function buildRawInitialState(
  stroke: StrokeId,
  tuning: StrokeTuning,
  mode: PlayMode = 'rally',
): BallState {
  const power = clamp01(tuning.power)
  const brush = clamp01(tuning.brush)

  if (mode === 'serve') {
    let speed = 34 + 16 * power
    let launchAngle = deg(4 + 7 * brush)
    let side = 0.35 + 0.45 * brush
    let tossY = 2.65 + 0.55 * brush

    let omega = v3(0, 0, 0)
    switch (stroke) {
      case 'flat':
        speed = 40 + 14 * power
        launchAngle = deg(1.5 + 2.5 * brush)
        side = 0.15 + 0.2 * brush
        omega = v3(8 + 22 * brush, 0, 0)
        break
      case 'topspin':
        speed = 31 + 11 * power
        launchAngle = deg(6 + 9 * brush)
        tossY = 2.72 + 0.42 * brush
        side = 0.22 + 0.3 * brush
        omega = v3(170 + 380 * brush, 0, 0)
        break
      case 'slice':
        speed = 32 + 13 * power
        launchAngle = deg(6 + 9 * brush)
        side = 0.5 + 0.55 * brush
        omega = v3(-(120 + 420 * brush), 0, 0)
        break
      case 'sideSpin':
        speed = 33 + 13 * power
        launchAngle = deg(5 + 8 * brush)
        side = 0.55 + 0.65 * brush
        omega = v3(60 * brush, 260 + 320 * brush, 0)
        break
    }

    const vyExtra =
      stroke === 'topspin' ? 0.8 + 1.4 * brush : 1.2 + 2.5 * brush
    const vy = speed * Math.sin(launchAngle) + vyExtra
    const vz = speed * Math.cos(launchAngle)

    return {
      position: v3(0.55, tossY, START_Z.serve),
      velocity: v3(side, vy, vz),
      omega,
    }
  }

  const speed = 21 * (0.55 + 0.55 * power)
  const launchAngle = deg(12 + 8 * brush)
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
    position: v3(0, 1.25 + 0.15 * brush, START_Z.rally),
    velocity: v3(0, vy, vz),
    omega,
  }
}

export function strokeDisplayLabel(stroke: StrokeId, mode: PlayMode): string {
  const p = STROKE_PRESETS[stroke]
  return mode === 'serve' ? p.serveLabel : p.label
}

export function buildInitialState(
  stroke: StrokeId,
  tuning: StrokeTuning,
  mode: PlayMode = 'rally',
): BallState {
  return fitInitialStateToCourt(
    buildRawInitialState(stroke, tuning, mode),
    mode,
  )
}

/** Server feet reference (visual); ball contact uses START_Z.serve. */
export function serverAnchorZ(): number {
  return -COURT.halfLength
}
