import { isPositionInSinglesCourt } from '../court/bounds'
import { applyGroundBounce, detectGroundContact } from './bounce'
import { BALL_MASS_KG, BALL_RADIUS_M } from './constants'
import type { BallState, SimOptions, TrajectoryPoint } from './types'
import { add, scale } from './vec3'
import { computeForces } from './forces'

const DEFAULT_DT = 0.004

function stepState(state: BallState, dt: number, options: SimOptions): BallState {
  const accel = (s: BallState) => {
    const f = computeForces(s, options)
    return scale(f.total, 1 / BALL_MASS_KG)
  }

  const k1v = accel(state)
  const k1p = state.velocity

  const s2: BallState = {
    position: add(state.position, scale(k1p, dt * 0.5)),
    velocity: add(state.velocity, scale(k1v, dt * 0.5)),
    omega: state.omega,
  }
  const k2v = accel(s2)
  const k2p = s2.velocity

  const s3: BallState = {
    position: add(state.position, scale(k2p, dt * 0.5)),
    velocity: add(state.velocity, scale(k2v, dt * 0.5)),
    omega: state.omega,
  }
  const k3v = accel(s3)
  const k3p = s3.velocity

  const s4: BallState = {
    position: add(state.position, scale(k3p, dt)),
    velocity: add(state.velocity, scale(k3v, dt)),
    omega: state.omega,
  }
  const k4v = accel(s4)
  const k4p = s4.velocity

  return {
    position: add(
      state.position,
      scale(
        add(
          add(k1p, scale(k2p, 2)),
          add(scale(k3p, 2), k4p),
        ),
        dt / 6,
      ),
    ),
    velocity: add(
      state.velocity,
      scale(
        add(
          add(k1v, scale(k2v, 2)),
          add(scale(k3v, 2), k4v),
        ),
        dt / 6,
      ),
    ),
    omega: state.omega,
  }
}

export function integrateTrajectory(
  initial: BallState,
  durationSec: number,
  options: SimOptions = {},
): TrajectoryPoint[] {
  const dt = options.dt ?? DEFAULT_DT
  const maxPoints = options.maxPoints ?? 6000
  const enableBounce = options.enableBounce ?? false
  const maxBounces = options.maxBounces ?? 2
  const stopAtGround = enableBounce ? false : (options.stopAtGround ?? true)
  const stopAtCourtBounds = options.stopAtCourtBounds ?? false
  const simOptions: SimOptions = {
    enableGravity: options.enableGravity ?? true,
    enableDrag: options.enableDrag ?? true,
    enableMagnus: options.enableMagnus ?? true,
  }

  const points: TrajectoryPoint[] = [{ ...initial, t: 0, flightSegment: 0 }]
  let state = initial
  let t = 0
  let bounceCount = 0
  let flightSegment = 0

  while (t < durationSec && points.length < maxPoints) {
    state = stepState(state, dt, simOptions)
    t += dt

    if (enableBounce && detectGroundContact(state)) {
      if (bounceCount >= maxBounces) {
        state = {
          ...state,
          position: {
            ...state.position,
            y: BALL_RADIUS_M,
          },
          velocity: { x: 0, y: 0, z: 0 },
          omega: { x: 0, y: 0, z: 0 },
        }
        points.push({ ...state, t, flightSegment })
        break
      }
      state = applyGroundBounce(state)
      bounceCount++
      flightSegment = bounceCount
    }

    if (stopAtGround && state.position.y < BALL_RADIUS_M - 0.02) break
    if (
      stopAtCourtBounds &&
      !isPositionInSinglesCourt(state.position.x, state.position.z)
    ) {
      break
    }
    points.push({ ...state, t, flightSegment })
  }

  return points
}

export function sampleAtTime(
  points: TrajectoryPoint[],
  time: number,
): TrajectoryPoint {
  if (points.length === 0) {
    throw new Error('empty trajectory')
  }
  if (time <= points[0].t) return points[0]
  const last = points[points.length - 1]
  if (time >= last.t) return last

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    if (time >= a.t && time <= b.t) {
      const u = (time - a.t) / (b.t - a.t)
      const lerp = (x: number, y: number) => x + (y - x) * u
      return {
        t: time,
        position: {
          x: lerp(a.position.x, b.position.x),
          y: lerp(a.position.y, b.position.y),
          z: lerp(a.position.z, b.position.z),
        },
        velocity: {
          x: lerp(a.velocity.x, b.velocity.x),
          y: lerp(a.velocity.y, b.velocity.y),
          z: lerp(a.velocity.z, b.velocity.z),
        },
        omega: a.omega,
        flightSegment: a.flightSegment,
      }
    }
  }
  return last
}

export function flightSummary(points: TrajectoryPoint[]) {
  const maxY = Math.max(...points.map((p) => p.position.y))
  const end = points[points.length - 1]
  const netCross = points.find((p) => p.position.z >= 0)

  const bounces: { t: number; x: number; z: number; index: number }[] = []
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const cur = points[i]
    if (
      prev.velocity.y < 0 &&
      cur.velocity.y > 0 &&
      cur.position.y < BALL_RADIUS_M + 0.15
    ) {
      bounces.push({
        t: cur.t,
        x: cur.position.x,
        z: cur.position.z,
        index: bounces.length + 1,
      })
    }
  }

  return {
    duration: end.t,
    maxHeight: maxY,
    landing: end.position,
    netClearance: netCross ? netCross.position.y : null,
    bounces,
    firstLanding: bounces[0] ?? null,
    secondLanding: bounces[1] ?? null,
  }
}
