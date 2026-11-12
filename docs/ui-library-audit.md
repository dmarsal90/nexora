# Nexora UI library audit

Reviewed 2026-11-12 before adding frontend dependencies. The repository currently has no React app, lockfile, approved Nexora mockup, or brand token source. Versions below are the latest versions visible in the package registries during review; they are a verification snapshot, not a decision to add every package.

## Decisions

| Name in brief | Verified identity and version | License and compatibility | Decision |
|---|---|---|---|
| Tailwind CSS | `tailwindcss` 4.3.5 | MIT. Official Vite plugin and React + TypeScript setup are documented. | Adopt as the styling foundation. |
| shadcn/ui | Source component system, installed through `shadcn` CLI 4.23.0 | MIT. Official Vite guide supports React + TypeScript and Tailwind CSS v4. | Adopt as the main component foundation; own the copied components in `packages/ui`. |
| Motion | `motion` 14.12.0, imported from `motion/react` | MIT; React 18.2+; official docs cover Vite. | Adopt as the single React animation engine. |
| InteraUI | The product exists. The package is `@elizabthpazp/intera-ui` 1.2.2, MIT. | Its docs claim React 18+, Tailwind and TypeScript declarations. They document Next.js, but do not establish Vite compatibility or provide enough evidence to validate its global CSS/API against Nexora tokens. | Do not install by default. Review individual components if a concrete gap appears; avoid importing its global stylesheet. |
| “Animate” | Ambiguous by itself. The closest verified React component product is Animate UI: `@animate-ui/react` 2.4.1. | Its docs require React 19 and `motion`; registry metadata reports `SEE LICENSE IN LICENSE.md`, so verify that license text before use. It overlaps the chosen Motion engine and shadcn primitives. | Do not add as another runtime. Use Motion directly; reconsider only if a specific animated primitive justifies its extra abstraction and license is confirmed. |
| HeroUI | `@heroui/react` 3.2.7 | Apache-2.0. Built for React 19 and Tailwind CSS v4, using React Aria. | Optional, feature-by-feature only. Add only where shadcn primitives do not meet a demonstrated accessibility or interaction need; do not duplicate component families. |
| Aceternity UI | Source components through the shadcn registry; not a single runtime package. | React 19, Tailwind CSS v4, TypeScript and Motion are documented. Its Aceternity License allows use in commercial end products but restricts redistributing source/assets and marketplace templates. Check each component and third-party asset terms. | Use selectively as copied source for premium-facing moments, subject to component-level license review. |
| Magic UI | Source components through its shadcn registry; not a single runtime package. | Official repository states MIT; React, TypeScript, Tailwind and Motion. Vite installation docs exist. | Use selectively as copied source. Reuse the existing Motion runtime and Nexora tokens. |

## Integration rules

- Tailwind tokens and Nexora CSS variables are authoritative. Components copied from registries must use the internal tokens and must not introduce a second global theme.
- `packages/ui` is the public internal API. Registry code belongs in an internal category and receives an accessibility, responsive, reduced-motion, bundle and license review before use.
- Motion is the only animation runtime. Prefer CSS for simple transitions, lazy-load expensive visual components, and honor `prefers-reduced-motion`.
- HeroUI is a targeted supplement. Do not mix HeroUI and shadcn implementations for the same component role without a documented reason.
- Apply the approved Nexora mockup and palette before defining brand color values. The repository currently contains neither, so this audit does not invent them.
- Recheck exact package versions and peer dependencies when the Vite app is created; pin compatible releases in its lockfile instead of using floating versions.

## Sources

- [Tailwind CSS package](https://www.npmjs.com/package/tailwindcss) and [shadcn/ui Vite setup](https://ui.shadcn.com/docs/installation/vite)
- [shadcn CLI package](https://www.npmjs.com/package/shadcn) and [shadcn/ui license](https://github.com/shadcn-ui/ui)
- [HeroUI React package](https://www.npmjs.com/package/@heroui/react) and [HeroUI framework support](https://heroui.com/en/docs/react/getting-started/frameworks)
- [Motion package and license](https://www.npmjs.com/package/motion) and [Motion React installation](https://motion.dev/docs/react-installation)
- [InteraUI package](https://www.npmjs.com/package/@elizabthpazp/intera-ui) and [InteraUI installation guidance](https://intera-ui.elijs.dev/es/docs/getting-started/installation)
- [Animate UI React package docs](https://animate-ui.com/docs/react) and [npm package metadata](https://www.npmjs.com/package/@animate-ui/react)
- [Aceternity requirements](https://ui.aceternity.com/installation) and [Aceternity license](https://ui.aceternity.com/licence)
- [Magic UI docs](https://magicui.design/docs), [Vite guide](https://v3.magicui.design/docs/installation/vite), and [MIT license](https://github.com/magicuidesign/magicui)
