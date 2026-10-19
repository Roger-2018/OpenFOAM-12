import { describe, expect, it } from 'vitest'
import {
  getAeroCoefficients,
  getAeroSource,
  loadAeroTableFromCsv,
  resetAeroToDemoTable,
} from './aeroProvider'

const OF_CSV = `Re,spin_param,Cd,Cl,notes
100000,0,0.51,0,of
100000,1,0.53,0.2,of
`

describe('aeroProvider', () => {
  it('loads OpenFOAM CSV and uses interpolated Cl', () => {
    loadAeroTableFromCsv(OF_CSV, 'openfoam-csv')
    expect(getAeroSource()).toBe('openfoam-csv')
    const mid = getAeroCoefficients(35, 350)
    expect(mid.cl).toBeGreaterThan(0.05)
    resetAeroToDemoTable()
  })
})
