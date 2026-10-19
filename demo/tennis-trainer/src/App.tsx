import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { TennisScene, type CameraPreset } from './components/TennisScene'
import { flightSummary, integrateTrajectory } from './physics/integrate'
import {
  STROKE_PRESETS,
  buildInitialState,
  type StrokeId,
} from './presets/strokes'

const SIM_DURATION = 2.8

function strokeSelect(
  id: StrokeId,
  current: StrokeId,
  onChange: (s: StrokeId) => void,
) {
  return (
    <button
      key={id}
      type="button"
      className={current === id ? 'chip active' : 'chip'}
      style={
        current === id
          ? { borderColor: STROKE_PRESETS[id].color, color: STROKE_PRESETS[id].color }
          : undefined
      }
      onClick={() => onChange(id)}
    >
      {STROKE_PRESETS[id].label}
    </button>
  )
}

export default function App() {
  const [strokeA, setStrokeA] = useState<StrokeId>('topspin')
  const [strokeB, setStrokeB] = useState<StrokeId>('flat')
  const [compare, setCompare] = useState(true)
  const [power, setPower] = useState(0.78)
  const [brush, setBrush] = useState(0.72)
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [showForces, setShowForces] = useState(true)
  const [camera, setCamera] = useState<CameraPreset>('baseline')

  const tuning = useMemo(() => ({ power, brush }), [power, brush])

  const trajectoryA = useMemo(() => {
    const initial = buildInitialState(strokeA, tuning)
    return integrateTrajectory(initial, SIM_DURATION, { stopAtCourtBounds: true })
  }, [strokeA, tuning])

  const trajectoryB = useMemo(() => {
    const initial = buildInitialState(strokeB, tuning)
    return integrateTrajectory(initial, SIM_DURATION, { stopAtCourtBounds: true })
  }, [strokeB, tuning])

  const summaryA = useMemo(() => flightSummary(trajectoryA), [trajectoryA])
  const summaryB = useMemo(() => flightSummary(trajectoryB), [trajectoryB])

  useEffect(() => {
    setTime(0)
  }, [strokeA, strokeB, power, brush])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setTime((t) => {
        const next = t + dt
        return next > SIM_DURATION ? 0 : next
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, strokeA, strokeB, power, brush])

  const activePreset = STROKE_PRESETS[strokeA]

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>网球轨迹演示</h1>
          <p className="subtitle">
            选择挥拍类型，观察上旋、切削、侧旋与平击在 3D 球场中的飞行差异（简化物理模型，用于入门理解）。
          </p>
        </div>
        <div className="legend">
          <span className="dot" style={{ background: STROKE_PRESETS[strokeA].color }} />
          A: {STROKE_PRESETS[strokeA].label}
          {compare && (
            <>
              <span className="dot" style={{ background: STROKE_PRESETS[strokeB].color }} />
              B: {STROKE_PRESETS[strokeB].label}
            </>
          )}
        </div>
      </header>

      <div className="layout">
        <aside className="panel">
          <section>
            <h2>轨迹 A</h2>
            <div className="chips">
              {(Object.keys(STROKE_PRESETS) as StrokeId[]).map((id) =>
                strokeSelect(id, strokeA, setStrokeA),
              )}
            </div>
          </section>

          <section>
            <label className="row">
              <input
                type="checkbox"
                checked={compare}
                onChange={(e) => setCompare(e.target.checked)}
              />
              对比轨迹 B
            </label>
            {compare && (
              <>
                <h2>轨迹 B</h2>
                <div className="chips">
                  {(Object.keys(STROKE_PRESETS) as StrokeId[]).map((id) =>
                    strokeSelect(id, strokeB, setStrokeB),
                  )}
                </div>
              </>
            )}
          </section>

          <section>
            <h2>击球感觉</h2>
            <label>
              力量 {Math.round(power * 100)}%
              <input
                type="range"
                min={0.35}
                max={1}
                step={0.01}
                value={power}
                onChange={(e) => setPower(Number(e.target.value))}
              />
            </label>
            <label>
              刷球 {Math.round(brush * 100)}%
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.01}
                value={brush}
                onChange={(e) => setBrush(Number(e.target.value))}
              />
            </label>
          </section>

          <section>
            <h2>视角</h2>
            <div className="chips">
              {(
                [
                  ['baseline', '底线'],
                  ['side', '侧面'],
                  ['top', '俯视'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={camera === id ? 'chip active' : 'chip'}
                  onClick={() => setCamera(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className="tips">
            <h2>{activePreset.label}</h2>
            <p>{activePreset.description}</p>
            <label className="row">
              <input
                type="checkbox"
                checked={showForces}
                onChange={(e) => setShowForces(e.target.checked)}
              />
              显示力矢量（灰=重力，橙=阻力，绿=Magnus）
            </label>
          </section>

          <section className="metrics">
            <h2>读数</h2>
            <ul>
              <li>
                A 过网高度:{' '}
                {summaryA.netClearance != null
                  ? `${summaryA.netClearance.toFixed(2)} m`
                  : '—'}
              </li>
              <li>A 最高点: {summaryA.maxHeight.toFixed(2)} m</li>
              <li>
                A 落点 (z): {summaryA.landing.z.toFixed(1)} m（网为 z=0）
              </li>
              {compare && (
                <>
                  <li>
                    B 过网高度:{' '}
                    {summaryB.netClearance != null
                      ? `${summaryB.netClearance.toFixed(2)} m`
                      : '—'}
                  </li>
                  <li>B 最高点: {summaryB.maxHeight.toFixed(2)} m</li>
                </>
              )}
            </ul>
          </section>
        </aside>

        <main className="viewport">
          <TennisScene
            trajectoryA={trajectoryA}
            trajectoryB={trajectoryB}
            colorA={STROKE_PRESETS[strokeA].color}
            colorB={STROKE_PRESETS[strokeB].color}
            compare={compare}
            time={time}
            showForces={showForces}
            camera={camera}
          />
          <div className="timeline">
            <button type="button" onClick={() => setPlaying((p) => !p)}>
              {playing ? '暂停' : '播放'}
            </button>
            <input
              type="range"
              min={0}
              max={SIM_DURATION}
              step={0.01}
              value={time}
              onChange={(e) => {
                setPlaying(false)
                setTime(Number(e.target.value))
              }}
            />
            <span>{time.toFixed(2)} s</span>
          </div>
        </main>
      </div>
    </div>
  )
}
