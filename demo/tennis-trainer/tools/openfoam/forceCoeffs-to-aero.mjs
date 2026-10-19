#!/usr/bin/env node
/**
 * 从 OpenFOAM tennisBallCoeffs 输出追加一行到 aero CSV
 *
 *   node tools/openfoam/forceCoeffs-to-aero.mjs \
 *     --dat postProcessing/tennisBallCoeffs/100/tennisBallCoeffs.dat \
 *     --U 35 --omega-x 400 \
 *     --out data/aero/build-from-of.csv
 */
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../..')

const BALL_RADIUS = 0.034
const NU = 1.5e-5

/** 与 src/physics/openfoamForceCoeffs.ts 列约定一致：Time Cm Cd Cl … */
function parseForceCoeffsDat(text, tailAverage = 20) {
  const rows = []
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
  if (rows.length === 0) throw new Error('forceCoeffs .dat 无有效数据行')
  const slice = rows.slice(-Math.min(tailAverage, rows.length))
  const cd = slice.reduce((s, r) => s + r.cd, 0) / slice.length
  const cl = slice.reduce((s, r) => s + r.cl, 0) / slice.length
  return { cd, cl, sampleCount: slice.length }
}

function buildRow(uinf, omegaX, cd, cl, notes) {
  const d = 2 * BALL_RADIUS
  const re = (uinf * d) / NU
  const sp = (BALL_RADIUS * Math.abs(omegaX)) / uinf
  return `${re.toFixed(0)},${sp.toFixed(4)},${cd.toFixed(4)},${cl.toFixed(4)},${notes}`
}

function parseArgs(argv) {
  const out = {
    dat: '',
    U: 0,
    omegaX: 0,
    out: resolve(root, 'data/aero/build-from-of.csv'),
    notes: 'openfoam-forceCoeffs',
  }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dat') out.dat = argv[++i]
    else if (a === '--U') out.U = Number(argv[++i])
    else if (a === '--omega-x') out.omegaX = Number(argv[++i])
    else if (a === '--out') out.out = resolve(argv[++i])
    else if (a === '--notes') out.notes = argv[++i]
  }
  if (!out.dat || !out.U) {
    console.error('需要 --dat <file> --U <m/s> [--omega-x rad/s] [--out csv]')
    process.exit(1)
  }
  return out
}

const args = parseArgs(process.argv)
const datText = readFileSync(resolve(args.dat), 'utf8')
const { cd, cl, sampleCount } = parseForceCoeffsDat(datText)
const row = buildRow(args.U, args.omegaX, cd, cl, args.notes)
const header = 'Re,spin_param,Cd,Cl,notes'

try {
  readFileSync(args.out)
} catch {
  writeFileSync(args.out, `${header}\n`, 'utf8')
}
appendFileSync(args.out, `${row}\n`, 'utf8')
console.log(`平均 ${sampleCount} 步: Cd=${cd.toFixed(4)} Cl=${cl.toFixed(4)}`)
console.log(`已追加 → ${args.out}`)
