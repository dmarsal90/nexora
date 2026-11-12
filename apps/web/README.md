# Nexora web foundation

React 19 + Vite 8 app. Shared components live in the private `@nexora/ui` workspace. Tailwind CSS v4 and shadcn's Base UI components are used for the shared foundation; Motion is the only animation runtime.

## Verified direct dependencies

| Package | Version | License | Role |
|---|---:|---|---|
| `react`, `react-dom` | 19.3.1 | MIT | UI runtime |
| `vite` | 8.3.8 | MIT | Build and dev server |
| `@vitejs/plugin-react` | 6.3.0 | MIT | React + Vite integration; Vite 8 and Node 20.19+ / 22.12+ |
| `tailwindcss`, `@tailwindcss/vite` | 4.3.5 | MIT | Styling and Vite integration |
| `shadcn` | 4.23.0 | MIT | Component source CLI |
| `@base-ui/react` | 1.9.0 | MIT | Accessible, headless shadcn primitive dependency; supports React 17+, Vite and Tailwind |
| `class-variance-authority` | 0.7.1 | Apache-2.0 | Typed component variants |
| `cn` | 0.5.2 | MIT | Tailwind class merge helper, re-exported through the internal utility layer |
| `motion` | 14.12.0 | MIT | React animations, imported from `motion/react` when used |
| `@fontsource-variable/inter` | 5.3.0 | OFL-1.1 | Self-hosted Inter font; the app loads only the Latin variable font file |
| `typescript` | 7.0.2 | Apache-2.0 | Type checking |

The package lock pins the resolved dependency graph. Registry based component source (Aceternity UI, Magic UI) is added individually and reviewed with its own license terms. HeroUI remains optional and is not installed until a specific component need is identified. InteraUI and Animate UI are excluded as recorded in the library audit.

The current theme values are neutral scaffolding for checking both color schemes and shadcn primitives. Replace them with Nexora's approved palette when the approved sketch is provided.

## Commands

- `npm run dev` — start the app
- `npm run typecheck` — check TypeScript
- `npm run build` — typecheck and create a production build
