import { CanvasTexture, SRGBColorSpace } from 'three'
import { TENNIS_BALL_COLORS } from './ballAppearance'

/** 简易网球毛毡 + 白条缝线（教学用，非照片级）。 */
export function createTennisBallTexture(size = 512): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('canvas 2d unavailable')
  }

  const grd = ctx.createRadialGradient(
    size * 0.35,
    size * 0.32,
    size * 0.08,
    size * 0.5,
    size * 0.5,
    size * 0.55,
  )
  grd.addColorStop(0, '#eaff5c')
  grd.addColorStop(0.55, TENNIS_BALL_COLORS.felt)
  grd.addColorStop(1, TENNIS_BALL_COLORS.feltDark)
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = TENNIS_BALL_COLORS.seam
  ctx.lineWidth = size * 0.055
  ctx.lineCap = 'round'

  const drawSeam = (phase: number) => {
    ctx.beginPath()
    for (let i = 0; i <= 64; i++) {
      const t = i / 64
      const angle = t * Math.PI * 2
      const wobble = Math.sin(angle * 2 + phase) * size * 0.08
      const x = size * 0.5 + Math.cos(angle) * (size * 0.36 + wobble)
      const y = size * 0.5 + Math.sin(angle) * (size * 0.22 + wobble * 0.35)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  drawSeam(0)
  drawSeam(Math.PI * 0.65)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  return texture
}
