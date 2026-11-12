import { Button } from '@nexora/ui/components/primitives/button'
import { useTheme } from '@nexora/ui/hooks/use-theme'

export function ThemeToggle() {
  const { theme, setPreference } = useTheme()
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <Button
      aria-label={`Cambiar a modo ${nextTheme === 'dark' ? 'oscuro' : 'claro'}`}
      aria-pressed={theme === 'dark'}
      onClick={() => setPreference(nextTheme)}
      size="icon"
      title={`Cambiar a modo ${nextTheme === 'dark' ? 'oscuro' : 'claro'}`}
      variant="outline"
    >
      {theme === 'dark' ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M20.5 15.3A8.5 8.5 0 0 1 8.7 3.5 8.5 8.5 0 1 0 20.5 15.3Z" />
        </svg>
      )}
    </Button>
  )
}
