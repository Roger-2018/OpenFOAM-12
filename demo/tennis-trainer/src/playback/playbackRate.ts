export const PLAYBACK_RATES = [1, 0.5, 0.25] as const
export type PlaybackRate = (typeof PLAYBACK_RATES)[number]

export const PLAYBACK_RATE_LABELS: Record<PlaybackRate, string> = {
  1: '正常',
  0.5: '慢放 0.5×',
  0.25: '慢放 0.25×',
}

export function advanceSimulationTime(
  current: number,
  deltaRealSeconds: number,
  rate: PlaybackRate,
  maxDuration: number,
): number {
  const next = current + deltaRealSeconds * rate
  if (next > maxDuration) return 0
  return next
}
