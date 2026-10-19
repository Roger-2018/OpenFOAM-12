import { useEffect, useState } from 'react'
import {
  getAeroSource,
  loadAeroTableFromCsv,
  resetAeroToDemoTable,
} from '../physics/aeroProvider'

export function useAeroTableLoader() {
  const [source, setSource] = useState(getAeroSource())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/data/aero.csv')
        if (!res.ok) {
          resetAeroToDemoTable()
          if (!cancelled) setSource(getAeroSource())
          return
        }
        const text = await res.text()
        const isDemoOnly = text.includes('demo-analytic') && !text.includes('openfoam')
        loadAeroTableFromCsv(
          text,
          isDemoOnly ? 'demo-table' : 'openfoam-csv',
        )
        if (!cancelled) {
          setSource(getAeroSource())
          setError(null)
        }
      } catch (e) {
        resetAeroToDemoTable()
        if (!cancelled) {
          setSource(getAeroSource())
          setError(e instanceof Error ? e.message : '加载 aero.csv 失败')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { source, error }
}
