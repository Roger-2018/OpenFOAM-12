import {
  type AeroRow,
  interpolateCoefficient,
  parseAeroCsv,
  reynoldsNumber,
  spinParameter,
} from './aeroTable'
import { BALL_RADIUS_M } from './constants'
import defaultCsv from '../../data/aero/demo-default.csv?raw'

export type AeroSource = 'demo-formula' | 'demo-table' | 'openfoam-csv'

let activeTable: AeroRow[] = parseAeroCsv(defaultCsv)
let activeSource: AeroSource = 'demo-table'

/** 演示用解析公式（无表或表为空时回退）。 */
export function analyticLiftCoefficient(sp: number): number {
  const s = Math.min(sp, 2.5)
  return Math.min(0.65, (0.18 * s) / (1 + 0.35 * s))
}

export function analyticDragCoefficient(_re: number): number {
  return 0.55
}

export function getAeroSource(): AeroSource {
  return activeSource
}

export function getAeroTable(): readonly AeroRow[] {
  return activeTable
}

export function loadAeroTableFromCsv(
  csvText: string,
  source: AeroSource = 'openfoam-csv',
): void {
  const table = parseAeroCsv(csvText)
  if (table.length === 0) {
    throw new Error('CSV 无有效数据行')
  }
  activeTable = table
  activeSource = source
}

export function resetAeroToDemoTable(): void {
  activeTable = parseAeroCsv(defaultCsv)
  activeSource = 'demo-table'
}

export function getAeroCoefficients(speed: number, spinMag: number): {
  cd: number
  cl: number
  re: number
  spinParam: number
} {
  const re = reynoldsNumber(speed)
  const sp = spinParameter(BALL_RADIUS_M, spinMag, speed)

  if (activeSource === 'demo-formula' || activeTable.length === 0) {
    return {
      cd: analyticDragCoefficient(re),
      cl: analyticLiftCoefficient(sp),
      re,
      spinParam: sp,
    }
  }

  return {
    cd: interpolateCoefficient(activeTable, 'cd', re, sp),
    cl: interpolateCoefficient(activeTable, 'cl', re, sp),
    re,
    spinParam: sp,
  }
}
