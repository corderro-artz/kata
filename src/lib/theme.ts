import type { ThemeDefinition, ThemeId } from './types'

const STORAGE_KEY = 'kata.theme'

export const themes: ThemeDefinition[] = [
  {
    id: 'vapor-light',
    label: 'Light',
    scheme: 'light',
    description: 'Warm paper, burgundy bloom, and soft glass taken from Vaporsoft light mode.',
    tokens: {
      bg: '#f4efe8',
      'bg-elevated': 'rgba(255, 251, 247, 0.92)',
      surface: 'rgba(255, 252, 248, 0.72)',
      'surface-strong': '#fffaf5',
      text: '#121318',
      muted: 'rgba(18, 20, 24, 0.68)',
      border: 'rgba(18, 20, 24, 0.12)',
      accent: '#a11f31',
      'accent-soft': 'rgba(161, 31, 49, 0.12)',
      'accent-strong': '#bc3147',
      signal: '#66b6b7',
      grid: 'rgba(18, 20, 24, 0.06)',
      shadow: '0 2px 8px rgba(18, 20, 24, 0.1)',
      highlight: 'rgba(127, 208, 207, 0.16)',
      danger: '#a11f31',
      success: '#1d8c6e',
      code: '#1d2026',
    },
  },
  {
    id: 'vapor-dark',
    label: 'Dark',
    scheme: 'dark',
    description: 'Obsidian fabric with burgundy halos and warm ink from Vaporsoft dark mode.',
    tokens: {
      bg: '#07080b',
      'bg-elevated': 'rgba(14, 16, 21, 0.94)',
      surface: 'rgba(10, 12, 16, 0.78)',
      'surface-strong': '#11141a',
      text: '#f2ede6',
      muted: 'rgba(242, 237, 230, 0.74)',
      border: 'rgba(242, 237, 230, 0.14)',
      accent: '#bc3147',
      'accent-soft': 'rgba(161, 31, 49, 0.18)',
      'accent-strong': '#df5c70',
      signal: '#7fd0cf',
      grid: 'rgba(242, 237, 230, 0.07)',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      highlight: 'rgba(127, 208, 207, 0.14)',
      danger: '#ff6f7d',
      success: '#56d4a8',
      code: '#fff7ef',
    },
  },
  {
    id: 'flat-light',
    label: 'Flat Light',
    scheme: 'light',
    description: 'Brand tones without atmospheric gradients for denser analytical work.',
    tokens: {
      bg: '#f3ede5',
      'bg-elevated': '#fbf7f2',
      surface: '#fffaf4',
      'surface-strong': '#ffffff',
      text: '#121318',
      muted: 'rgba(18, 20, 24, 0.66)',
      border: 'rgba(18, 20, 24, 0.11)',
      accent: '#9d2233',
      'accent-soft': 'rgba(157, 34, 51, 0.1)',
      'accent-strong': '#b63246',
      signal: '#579e9f',
      grid: 'rgba(18, 20, 24, 0.05)',
      shadow: '0 2px 8px rgba(18, 20, 24, 0.06)',
      highlight: 'rgba(87, 158, 159, 0.12)',
      danger: '#8f1625',
      success: '#1c8067',
      code: '#1e2128',
    },
  },
  {
    id: 'flat-dark',
    label: 'Flat Dark',
    scheme: 'dark',
    description: 'A quieter dark surface that keeps the same burgundy and signal accents.',
    tokens: {
      bg: '#0b0d11',
      'bg-elevated': '#11141a',
      surface: '#13171d',
      'surface-strong': '#181c23',
      text: '#efe9e1',
      muted: 'rgba(239, 233, 225, 0.72)',
      border: 'rgba(239, 233, 225, 0.13)',
      accent: '#b62d43',
      'accent-soft': 'rgba(182, 45, 67, 0.16)',
      'accent-strong': '#d64b61',
      signal: '#7dc7c6',
      grid: 'rgba(239, 233, 225, 0.06)',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.28)',
      highlight: 'rgba(125, 199, 198, 0.14)',
      danger: '#ff6a79',
      success: '#53d2a6',
      code: '#fff8ee',
    },
  },
  {
    id: 'contrast-light',
    label: 'High Contrast Light',
    scheme: 'light',
    description: 'Crisp ivory and ink with amplified burgundy focus states.',
    tokens: {
      bg: '#fffdf9',
      'bg-elevated': '#ffffff',
      surface: '#ffffff',
      'surface-strong': '#ffffff',
      text: '#050608',
      muted: 'rgba(5, 6, 8, 0.82)',
      border: 'rgba(5, 6, 8, 0.34)',
      accent: '#8c1223',
      'accent-soft': 'rgba(140, 18, 35, 0.12)',
      'accent-strong': '#b3142f',
      signal: '#006f70',
      grid: 'rgba(5, 6, 8, 0.1)',
      shadow: '0 0 0 rgba(0, 0, 0, 0)',
      highlight: 'rgba(0, 111, 112, 0.14)',
      danger: '#8c1223',
      success: '#006f53',
      code: '#050608',
    },
  },
  {
    id: 'contrast-dark',
    label: 'High Contrast Dark',
    scheme: 'dark',
    description: 'Pure dark foundation with bright text and assertive Vaporsoft accents.',
    tokens: {
      bg: '#000000',
      'bg-elevated': '#0b0b0d',
      surface: '#111214',
      'surface-strong': '#16181c',
      text: '#fffaf5',
      muted: 'rgba(255, 250, 245, 0.86)',
      border: 'rgba(255, 250, 245, 0.42)',
      accent: '#ff5871',
      'accent-soft': 'rgba(255, 88, 113, 0.18)',
      'accent-strong': '#ff8a9d',
      signal: '#8ff6f5',
      grid: 'rgba(255, 250, 245, 0.12)',
      shadow: '0 0 0 rgba(0, 0, 0, 0)',
      highlight: 'rgba(143, 246, 245, 0.18)',
      danger: '#ff7c8f',
      success: '#6ef9c9',
      code: '#fffaf5',
    },
  },
]

const themeMap = new Map(themes.map((theme) => [theme.id, theme]))

export const defaultThemeId: ThemeId = 'vapor-dark'

export function loadPreferredTheme(): ThemeId {
  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeId | null
  if (stored && themeMap.has(stored)) {
    return stored
  }

  return defaultThemeId
}

export function applyTheme(themeId: ThemeId): void {
  const theme = themeMap.get(themeId) ?? themeMap.get(defaultThemeId)
  if (!theme) {
    return
  }

  const root = document.documentElement
  root.dataset.theme = theme.id
  root.style.colorScheme = theme.scheme

  for (const [token, value] of Object.entries(theme.tokens)) {
    root.style.setProperty(`--${token}`, value)
  }

  window.localStorage.setItem(STORAGE_KEY, theme.id)
}