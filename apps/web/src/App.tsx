import { Button } from '@nexora/ui/components/primitives/button'
import { ThemeToggle } from '@nexora/ui/components/navigation/theme-toggle'

export default function App() {
  return (
    <main className="min-h-svh bg-[var(--nx-background)] px-6 py-16 text-[var(--nx-foreground)] sm:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium tracking-wide text-[var(--nx-muted-foreground)]">
            NEXORA · SISTEMA DE DISEÑO
          </p>
          <ThemeToggle />
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
          Base de interfaz lista
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[var(--nx-muted-foreground)]">
          La aplicación React y la capa UI están conectadas. Las pantallas y los
          colores de marca se incorporarán a partir del boceto aprobado.
        </p>
        <div className="mt-8">
          <Button type="button">Explorar el sistema UI</Button>
        </div>
      </div>
    </main>
  )
}
