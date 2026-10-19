/** ITF singles court (meters). Origin at net center on ground. +Z toward far baseline. */
export const COURT = {
  halfLength: 11.885,
  singlesHalfWidth: 8.23 / 2,
  netHeight: 0.914,
  netPostHeight: 1.07,
  serviceLineFromNet: 6.4,
  lineWidth: 0.05,
} as const

export const COURT_COLORS = {
  surface: '#1a6b42',
  lines: '#f8fafc',
  net: '#e2e8f0',
} as const
