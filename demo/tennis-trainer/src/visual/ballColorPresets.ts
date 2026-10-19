export type BallColorId = 'classic' | 'orange' | 'pink' | 'sky' | 'white'

export type BallColorScheme = {
  felt: string
  feltDark: string
  seam: string
  glow: string
  emissive: string
}

export const BALL_COLOR_PRESETS: Record<
  BallColorId,
  { label: string; colors: BallColorScheme }
> = {
  classic: {
    label: '经典黄绿',
    colors: {
      felt: '#d4f106',
      feltDark: '#9cb304',
      seam: '#ffffff',
      glow: '#fff9c4',
      emissive: '#3f4d00',
    },
  },
  orange: {
    label: '亮橙',
    colors: {
      felt: '#ffb020',
      feltDark: '#ea580c',
      seam: '#fff7ed',
      glow: '#ffedd5',
      emissive: '#7c2d12',
    },
  },
  pink: {
    label: '粉色',
    colors: {
      felt: '#fb7185',
      feltDark: '#e11d48',
      seam: '#fff1f2',
      glow: '#ffe4e6',
      emissive: '#881337',
    },
  },
  sky: {
    label: '天蓝',
    colors: {
      felt: '#38bdf8',
      feltDark: '#0284c7',
      seam: '#f0f9ff',
      glow: '#e0f2fe',
      emissive: '#0c4a6e',
    },
  },
  white: {
    label: '白球',
    colors: {
      felt: '#f8fafc',
      feltDark: '#cbd5e1',
      seam: '#64748b',
      glow: '#ffffff',
      emissive: '#334155',
    },
  },
}
