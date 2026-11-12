# `@nexora/ui`

Internal UI source layer for the Nexora frontend. Application code should import reusable components from here instead of depending directly on registry snippets.

## Ownership

- Tailwind CSS and shadcn/ui provide the base vocabulary and accessible primitives.
- Nexora tokens will be the only source for palette, typography, radii, spacing, and interaction states.
- Motion (`motion/react`) is the only React animation engine. CSS handles simple transitions. All motion must respect reduced-motion preferences.
- HeroUI is allowed only for a demonstrated component gap; a component role must have one implementation.
- Aceternity UI and Magic UI source may be adapted in `premium/` for focused product moments. Keep component-level license notices and review keyboard access, reduced motion, responsive behavior, and bundle impact.
- Do not import third-party global themes or add another animation runtime.

## Structure

```text
components/
  primitives/     shadcn-based primitives
  forms/          form controls and field patterns
  navigation/     sidebar, menus, breadcrumbs
  data-display/   cards, tables, badges
  feedback/       alerts, empty states, progress
  charts/         chart wrappers
  motion/         shared Motion patterns and reduced-motion helpers
  premium/        reviewed Aceternity/Magic UI adaptations
hooks/            shared UI hooks
styles/           theme entry points and global styles
tokens/           Nexora design tokens
utils/            shared component utilities
```

The repository has no approved Nexora mockup or source palette yet. Brand values and screen-specific components should be added when that source is available; this scaffold intentionally does not define substitute brand colors.

## Dependency policy

This directory is source scaffolding, not an independently published package. Pin dependencies in the eventual application manifest and lockfile after its React/Vite setup is known. Avoid adding runtime dependencies here without a concrete component requirement.
