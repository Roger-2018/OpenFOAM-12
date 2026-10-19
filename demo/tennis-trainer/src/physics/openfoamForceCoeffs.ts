import { reynoldsNumber, spinParameter } from './aeroTable'
import { BALL_RADIUS_M } from './constants'

export type ForceCoeffsDatSummary = {
  cd: number
  cl: number
  sampleCount: number
}

/** 解析 OpenFOAM forceCoeffs 主输出文件（Time Cm Cd Cl Cl(f) Cl(r)）。 */
export function parseForceCoeffsDat(
  text: string,
  tailAverage = 20,
): ForceCoeffsDatSummary {
  const rows: { cd: number; cl: number }[] = []

  for (const line of text.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const parts = t.split(/\s+/).filter(Boolean)
    if (parts.length < 4) continue
    const time = Number(parts[0])
    if (!Number.isFinite(time)) continue
    const cd = Number(parts[2])
    const cl = Number(parts[3])
    if (!Number.isFinite(cd) || !Number.isFinite(cl)) continue
    rows.push({ cd, cl })
  }

  if (rows.length === 0) {
    throw new Error('forceCoeffs .dat 中未找到有效数据行')
  }

  const slice = rows.slice(-Math.min(tailAverage, rows.length))
  const cd =
    slice.reduce((s, r) => s + r.cd, 0) / slice.length
  const cl =
    slice.reduce((s, r) => s + r.cl, 0) / slice.length

  return { cd, cl, sampleCount: slice.length }
}

export function buildAeroCsvRow(params: {
  uinf: number
  omegaX: number
  cd: number
  cl: number
  notes?: string
}): string {
  const re = reynoldsNumber(params.uinf)
  const sp = spinParameter(BALL_RADIUS_M, Math.abs(params.omegaX), params.uinf)
  const notes = params.notes ?? 'openfoam-forceCoeffs'
  return `${re.toFixed(0)},${sp.toFixed(4)},${params.cd.toFixed(4)},${params.cl.toFixed(4)},${notes}`
}
