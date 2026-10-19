import type { Vec3 } from './types'

export const v3 = (x: number, y: number, z: number): Vec3 => ({ x, y, z })

export const add = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
})

export const sub = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.x - b.x,
  y: a.y - b.y,
  z: a.z - b.z,
})

export const scale = (a: Vec3, s: number): Vec3 => ({
  x: a.x * s,
  y: a.y * s,
  z: a.z * s,
})

export const length = (a: Vec3): number =>
  Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z)

export const normalize = (a: Vec3): Vec3 => {
  const len = length(a)
  if (len < 1e-12) return { x: 0, y: 0, z: 0 }
  return scale(a, 1 / len)
}

export const cross = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
})

export const dot = (a: Vec3, b: Vec3): number =>
  a.x * b.x + a.y * b.y + a.z * b.z
