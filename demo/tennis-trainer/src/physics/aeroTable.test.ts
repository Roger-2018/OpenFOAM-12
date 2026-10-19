import { describe, expect, it } from 'vitest'
import {
  interpolateCoefficient,
  parseAeroCsv,
  reynoldsNumber,
  spinParameter,
} from './aeroTable'

const SAMPLE_CSV = `Re,spin_param,Cd,Cl,notes
80000,0,0.58,0,openfoam-steady
80000,0.5,0.59,0.12,openfoam-steady
120000,0,0.52,0,openfoam-steady
120000,0.5,0.54,0.15,openfoam-steady
`

describe('aeroTable', () => {
  it('parses OpenFOAM-style CSV export', () => {
    const table = parseAeroCsv(SAMPLE_CSV)
    expect(table).toHaveLength(4)
    expect(table[0].re).toBe(80000)
  })

  it('interpolates Cd/Cl between Reynolds and spin', () => {
    const table = parseAeroCsv(SAMPLE_CSV)
    const cd = interpolateCoefficient(table, 'cd', 100000, 0.25)
    const cl = interpolateCoefficient(table, 'cl', 100000, 0.25)
    expect(cd).toBeGreaterThan(0.5)
    expect(cl).toBeGreaterThan(0)
    expect(cl).toBeLessThan(0.15)
  })

  it('computes Re and spin parameter from state scalars', () => {
    expect(reynoldsNumber(30)).toBeCloseTo(136000, -3)
    expect(spinParameter(0.034, 200, 30)).toBeCloseTo(0.227, 2)
  })
})
