import type { ThemeDefinition, ThemeId } from './types'

const STORAGE_KEY = 'kata.theme'

export const themes: ThemeDefinition[] = [
  {
    id: 'vapor-light',
    label: 'Light',
    scheme: 'light',
    description: 'Warm parchment with sectioned panels and burgundy accents.',
    tokens: {
      bg: '#f4efe8',
      'bg-elevated': '#f8f3ed',
      surface: '#f1ece4',
      'surface-strong': '#ede7df',
      text: '#121318',
      muted: 'rgba(18, 20, 24, 0.72)',
      border: 'rgba(18, 20, 24, 0.20)',
      accent: '#a11f31',
      'accent-soft': 'rgba(161, 31, 49, 0.12)',
      'accent-strong': '#b92f44',
      signal: '#5a7f8c',
      grid: 'rgba(18, 20, 24, 0.06)',
      shadow: '0 2px 8px rgba(18, 20, 24, 0.10)',
      highlight: 'rgba(90, 127, 140, 0.14)',
      danger: '#a11f31',
      success: '#3d6b52',
      code: '#121318',
    },
  },
  {
    id: 'vapor-dark',
    label: 'Dark',
    scheme: 'dark',
    description: 'Deep ink with defined panels and warm burgundy accents.',
    tokens: {
      bg: '#07080b',
      'bg-elevated': '#0b0c10',
      surface: '#0a0b10',
      'surface-strong': '#0f1118',
      text: '#f2ede6',
      muted: 'rgba(242, 237, 230, 0.78)',
      border: 'rgba(242, 237, 230, 0.20)',
      accent: '#a11f31',
      'accent-soft': 'rgba(161, 31, 49, 0.18)',
      'accent-strong': '#ba3447',
      signal: '#7fb0c4',
      grid: 'rgba(242, 237, 230, 0.07)',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.32)',
      highlight: 'rgba(127, 176, 196, 0.14)',
      danger: '#a11f31',
      success: '#a6c08a',
      code: '#f2ede6',
    },
  },
  {
    id: 'flat-light',
    label: 'Flat Light',
    scheme: 'light',
    description: 'Borderless parchment where all sections flow as one seamless page.',
    tokens: {
      bg: '#f4efe8',
      'bg-elevated': '#f4efe8',
      surface: '#f4efe8',
      'surface-strong': '#f4efe8',
      text: '#121318',
      muted: 'rgba(18, 20, 24, 0.72)',
      border: 'transparent',
      accent: '#a11f31',
      'accent-soft': 'rgba(161, 31, 49, 0.12)',
      'accent-strong': '#b92f44',
      signal: '#5a7f8c',
      grid: 'rgba(18, 20, 24, 0.04)',
      shadow: 'none',
      highlight: 'rgba(90, 127, 140, 0.14)',
      danger: '#a11f31',
      success: '#3d6b52',
      code: '#121318',
    },
  },
  {
    id: 'flat-dark',
    label: 'Flat Dark',
    scheme: 'dark',
    description: 'Borderless ink where all sections flow as one seamless page.',
    tokens: {
      bg: '#07080b',
      'bg-elevated': '#07080b',
      surface: '#07080b',
      'surface-strong': '#07080b',
      text: '#f2ede6',
      muted: 'rgba(242, 237, 230, 0.78)',
      border: 'transparent',
      accent: '#a11f31',
      'accent-soft': 'rgba(161, 31, 49, 0.18)',
      'accent-strong': '#ba3447',
      signal: '#7fb0c4',
      grid: 'rgba(242, 237, 230, 0.05)',
      shadow: 'none',
      highlight: 'rgba(127, 176, 196, 0.14)',
      danger: '#a11f31',
      success: '#a6c08a',
      code: '#f2ede6',
    },
  },
  {
    id: 'contrast-light',
    label: 'High Contrast Light',
    scheme: 'light',
    description: 'Parchment with reinforced borders and solid burgundy focus states.',
    tokens: {
      bg: '#f4efe8',
      'bg-elevated': '#f8f3ed',
      surface: '#f1ece4',
      'surface-strong': '#ede7df',
      text: '#121318',
      muted: 'rgba(18, 20, 24, 0.72)',
      border: 'rgba(18, 20, 24, 0.30)',
      accent: '#a11f31',
      'accent-soft': 'rgba(161, 31, 49, 0.12)',
      'accent-strong': '#b92f44',
      signal: '#3b5b6f',
      grid: 'rgba(18, 20, 24, 0.10)',
      shadow: '0 2px 8px rgba(18, 20, 24, 0.10)',
      highlight: 'rgba(59, 91, 111, 0.14)',
      danger: '#a11f31',
      success: '#3d6b52',
      code: '#121318',
    },
  },
  {
    id: 'contrast-dark',
    label: 'High Contrast Dark',
    scheme: 'dark',
    description: 'Pure black with amplified borders and bright burgundy focus states.',
    tokens: {
      bg: '#000000',
      'bg-elevated': '#05060a',
      surface: '#000000',
      'surface-strong': '#05060a',
      text: '#f2ede6',
      muted: 'rgba(242, 237, 230, 0.78)',
      border: 'rgba(242, 237, 230, 0.30)',
      accent: '#a11f31',
      'accent-soft': 'rgba(161, 31, 49, 0.18)',
      'accent-strong': '#ba3447',
      signal: '#7fb0c4',
      grid: 'rgba(242, 237, 230, 0.10)',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.32)',
      highlight: 'rgba(127, 176, 196, 0.14)',
      danger: '#a11f31',
      success: '#a6c08a',
      code: '#f2ede6',
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