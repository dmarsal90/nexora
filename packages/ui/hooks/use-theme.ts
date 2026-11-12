import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
export type ThemePreference = Theme | 'system'

const storageKey = 'nexora-theme'
const colorSchemeQuery = '(prefers-color-scheme: dark)'

function readPreference(): ThemePreference {
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Storage may be disabled. The system preference still works.
  }
  return 'system'
}

function readSystemTheme(): Theme {
  return window.matchMedia(colorSchemeQuery).matches ? 'dark' : 'light'
}

export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference)
  const [systemTheme, setSystemTheme] = useState<Theme>(readSystemTheme)
  const theme = preference === 'system' ? systemTheme : preference

  useEffect(() => {
    const root = document.documentElement

    if (preference === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.dataset.theme = preference
    }

    try {
      window.localStorage.setItem(storageKey, preference)
    } catch {
      // Keep the current session theme when storage is unavailable.
    }
  }, [preference])

  useEffect(() => {
    const media = window.matchMedia(colorSchemeQuery)
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  return {
    theme,
    preference,
    setPreference: setPreferenceState,
  }
}
