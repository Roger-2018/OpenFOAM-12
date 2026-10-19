import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  buildAeroCsvRow,
  parseForceCoeffsDat,
} from './openfoamForceCoeffs'

const FIXTURE_DAT = resolve(
  import.meta.dirname,
  '../../tools/openfoam/fixtures/tennisBallCoeffs.sample.dat',
)

const SAMPLE_DAT = `
# Force coefficients
# Time Cm Cd Cl Cl(f) Cl(r)
0.1 0.01 0.520 0.110 0.08 0.03
0.2 0.01 0.524 0.115 0.08 0.04
0.3 0.01 0.528 0.118 0.08 0.04
`

describe('openfoamForceCoeffs', () => {
  it('averages trailing Cd Cl from forceCoeffs dat', () => {
    const s = parseForceCoeffsDat(SAMPLE_DAT, 2)
    expect(s.sampleCount).toBe(2)
    expect(s.cd).toBeCloseTo(0.526, 3)
    expect(s.cl).toBeCloseTo(0.1165, 3)
  })

  it('parses OpenFOAM 12 sample tennisBallCoeffs.dat', () => {
    const text = readFileSync(FIXTURE_DAT, 'utf8')
    const s = parseForceCoeffsDat(text, 3)
    expect(s.sampleCount).toBe(3)
    expect(s.cd).toBeCloseTo(0.5195, 3)
    expect(s.cl).toBeCloseTo(0.105, 3)
  })

  it('builds CSV row with Re and spin_param', () => {
    const row = buildAeroCsvRow({
      uinf: 35,
      omegaX: 400,
      cd: 0.53,
      cl: 0.12,
    })
    const cols = row.split(',')
    expect(cols).toHaveLength(5)
    expect(Number(cols[2])).toBeCloseTo(0.53, 3)
    expect(Number(cols[3])).toBeCloseTo(0.12, 3)
  })
})
