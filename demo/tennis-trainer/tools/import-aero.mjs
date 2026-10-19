#!/usr/bin/env node
/**
 * 校验并安装 OpenFOAM 导出的 aero.csv 到 public/data/aero.csv
 * 用法: node tools/import-aero.mjs path/to/openfoam-aero.csv
 */
import { copyFileSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const out = resolve(root, 'public/data/aero.csv')

const src = process.argv[2]
if (!src) {
  console.error('用法: npm run import-aero -- <csv路径>')
  process.exit(1)
}

const text = readFileSync(resolve(src), 'utf8')
const lines = text.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith('#'))
if (lines.length < 2) {
  console.error('CSV 至少需要表头 + 一行数据')
  process.exit(1)
}
const header = lines[0].toLowerCase()
for (const col of ['re', 'spin_param', 'cd', 'cl']) {
  if (!header.includes(col)) {
    console.error(`缺少列: ${col}`)
    process.exit(1)
  }
}

copyFileSync(resolve(src), out)
console.log(`已安装到 ${out}`)
console.log('重启 npm run dev 后，应用会从 /data/aero.csv 加载系数。')
