import { BALL_RADIUS_M } from './constants'

/** 空气运动粘度 (m²/s)，近地面 20°C。 */
export const AIR_KINEMATIC_VISCOSITY = 1.5e-5

export type AeroRow = {
  re: number
  spinParam: number
  cd: number
  cl: number
  notes?: string
}

export function reynoldsNumber(speed: number): number {
  const diameter = 2 * BALL_RADIUS_M
  return (speed * diameter) / AIR_KINEMATIC_VISCOSITY
}

export function spinParameter(
  radius: number,
  spinMag: number,
  speed: number,
): number {
  if (speed < 1e-6) return 0
  return (radius * spinMag) / speed
}

export function parseAeroCsv(text: string): AeroRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))

  if (lines.length < 2) return []

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const idx = (name: string) => header.indexOf(name)

  const iRe = idx('re')
  const iSp = idx('spin_param')
  const iCd = idx('cd')
  const iCl = idx('cl')
  const iNotes = idx('notes')

  if ([iRe, iSp, iCd, iCl].some((i) => i < 0)) {
    throw new Error('CSV 需包含列: Re, spin_param, Cd, Cl')
  }

  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim())
    return {
      re: Number(cols[iRe]),
      spinParam: Number(cols[iSp]),
      cd: Number(cols[iCd]),
      cl: Number(cols[iCl]),
      notes: iNotes >= 0 ? cols[iNotes] : undefined,
    }
  })
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function interp1d(
  points: { x: number; y: number }[],
  x: number,
): number {
  if (points.length === 0) return 0
  const sorted = [...points].sort((a, b) => a.x - b.x)
  if (x <= sorted[0].x) return sorted[0].y
  if (x >= sorted[sorted.length - 1].x) return sorted[sorted.length - 1].y
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]
    const b = sorted[i + 1]
    if (x >= a.x && x <= b.x) {
      const u = (x - a.x) / (b.x - a.x)
      return lerp(a.y, b.y, u)
    }
  }
  return sorted[sorted.length - 1].y
}

/** 在 (Re, spin_param) 网格上线性插值 Cd 或 Cl。 */
export function interpolateCoefficient(
  table: AeroRow[],
  coeff: 'cd' | 'cl',
  re: number,
  spinParam: number,
): number {
  if (table.length === 0) return coeff === 'cd' ? 0.55 : 0

  const reValues = [...new Set(table.map((r) => r.re))].sort((a, b) => a - b)
  if (reValues.length === 1) {
    const rows = table.filter((r) => r.re === reValues[0])
    return interp1d(
      rows.map((r) => ({ x: r.spinParam, y: r[coeff] })),
      spinParam,
    )
  }

  let lo = reValues[0]
  let hi = reValues[reValues.length - 1]
  for (let i = 0; i < reValues.length - 1; i++) {
    if (re >= reValues[i] && re <= reValues[i + 1]) {
      lo = reValues[i]
      hi = reValues[i + 1]
      break
    }
  }
  if (re < reValues[0]) {
    lo = hi = reValues[0]
  } else if (re > reValues[reValues.length - 1]) {
    lo = hi = reValues[reValues.length - 1]
  }

  const atRe = (targetRe: number) =>
    interp1d(
      table
        .filter((r) => r.re === targetRe)
        .map((r) => ({ x: r.spinParam, y: r[coeff] })),
      spinParam,
    )

  if (lo === hi) return atRe(lo)
  const u = (re - lo) / (hi - lo)
  return lerp(atRe(lo), atRe(hi), u)
}
