# CLAUDE.md — QualityNeighbor

AI assistant guidance for the **QualityNeighbor** codebase.

---

## Project Overview

QualityNeighbor is the monthly digital newsletter for **Hartland Ranch**, a residential neighborhood in Lockhart, Texas. It is a fully static, client-side single-page application — no backend, no database, no external APIs.

**Live URL:** `https://qualityneighbor.hartlandranch.com/`

---

## Repository State

The repo contains **compiled build artifacts** at the root. The React/TypeScript source code previously lived in `/app/src` but was removed in the most recent commit (`d3459ea`). The `app/dist/` output was promoted to the repo root.

| Path | Contents |
|---|---|
| `index.html` | Compiled HTML entry point |
| `assets/` | Hashed CSS + JS bundles (`index-BNffZ7b0.css`, `index-gcGG6_V0.js`) |
| `images/` | Public image assets (events, stories, ads, spotlight) |
| `*.jpg` (root) | Legacy duplicate images for backwards compatibility |
| `manifest.json` | PWA manifest |
| `robots.txt`, `sitemap.xml` | SEO files |
| `llms.txt` | Human-readable project documentation |

**Source code must be restored to `/app/src/` before making code changes.** See the previous commit (`4b4256e`) for the full source tree.

---

## Tech Stack

| Category | Library / Version |
|---|---|
| Framework | React 19.2.0 + TypeScript 5.9.3 |
| Bundler | Vite 7.2.4 |
| Styling | Tailwind CSS 3.4.19 |
| Animations | GSAP 3.14.2 + ScrollTrigger + `@gsap/react` 2.1.2 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Icons | Lucide React 0.562.0 |
| Forms | React Hook Form 7.70.0 + Zod 4.3.5 |
| Dates | date-fns 4.1.0 |
| Carousel | Embla Carousel 8.6.0 |
| Class Merging | clsx 2.1.1 + tailwind-merge 3.4.0 |
| Node | 20 |

---

## Source Code Structure

When source code is present at `/app/src/`:

```
app/
├── index.html                  # Vite entry HTML
├── vite.config.ts              # Vite config; sets base './', @ alias → ./src
├── tailwind.config.js          # Custom warm editorial palette + fonts
├── tsconfig.json               # References app + node tsconfigs; @ path alias
├── tsconfig.app.json           # ES2022, strict, no-unused-vars enforced
├── postcss.config.js           # Tailwind + Autoprefixer
├── eslint.config.js            # Flat ESLint config (typescript-eslint + react-hooks)
├── components.json             # shadcn/ui config; ui path = src/components/ui
├── package.json                # Scripts and dependencies
└── src/
    ├── main.tsx                # React entry point
    ├── App.tsx                 # Root component; GSAP ScrollTrigger init
    ├── App.css                 # App-scoped styles
    ├── index.css               # Global styles, CSS variables, Tailwind @layer
    ├── components/
    │   ├── Navigation.tsx      # Fixed header + responsive mobile Sheet menu
    │   ├── QuickActionButton.tsx  # Floating action button (FAB)
    │   └── ui/                 # All shadcn/ui components (40+)
    ├── sections/               # One component per page section
    │   ├── HeroSection.tsx
    │   ├── AtAGlanceSection.tsx
    │   ├── NeedsSection.tsx
    │   ├── EventsSection.tsx
    │   ├── PollSection.tsx
    │   ├── StorySection.tsx
    │   ├── GardenTipSection.tsx
    │   ├── BusinessAdsSection.tsx
    │   ├── SpotlightSection.tsx
    │   ├── ShoutoutsSection.tsx
    │   ├── ResourcesSection.tsx
    │   └── ContactSection.tsx
    ├── hooks/
    │   ├── useCountdown.ts       # Time-remaining countdown for events
    │   ├── useLocalStorage.ts    # Persist state to localStorage
    │   ├── useScrollAnimation.ts # GSAP helpers for scroll animations
    │   ├── useReducedMotion.ts   # Detects prefers-reduced-motion
    │   └── use-mobile.ts         # Mobile breakpoint (768px)
    └── lib/
        └── utils.ts              # cn() — merges Tailwind classes via clsx + tailwind-merge
```

---

## Development Commands

All commands run from the `/app` directory:

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Type-check (tsc -b) then bundle for production
npm run lint      # Run ESLint across all files
npm run preview   # Preview the production build locally
```

There is **no test runner configured**. This project has no unit or integration tests.

---

## Path Aliases

`@/*` resolves to `./src/*`. Configured in:
- `vite.config.ts` (resolve.alias)
- `tsconfig.json` (compilerOptions.paths)
- `components.json` (shadcn aliases)

```typescript
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCountdown } from '@/hooks/useCountdown';
import { HeroSection } from '@/sections/HeroSection';
```

---

## Styling Conventions

### Design Language

Warm editorial / vintage newspaper aesthetic.

### Tailwind Custom Colors (CSS HSL variables in `:root`)

| Variable | Value | Usage |
|---|---|---|
| `--paper-primary` | `42 33% 93%` (#F4F1EA) | Main background (warm cream) |
| `--paper-secondary` | `37 24% 88%` (#E9E2D7) | Deeper paper tone |
| `--vintage-red` | `356 74% 44%` (#C31F2B) | CTAs, accents, theme-color |
| `--espresso` | `24 32% 13%` (#2B1F16) | Primary text |
| `--warm-brown` | `28 21% 36%` (#6E5C4B) | Secondary text |
| `--cream` | `42 50% 97%` (#FDFCF9) | Card backgrounds |

### Typography (Google Fonts)

| Class | Font | Use |
|---|---|---|
| `font-display` | Fraunces (serif) | Headlines, display text |
| `font-body` | Inter (sans-serif) | Body copy |
| `font-mono` | Space Mono | Dates, metadata, labels |

### Class Merging

Always use `cn()` from `@/lib/utils` to merge Tailwind classes — never concatenate strings manually.

```typescript
import { cn } from '@/lib/utils';
<div className={cn('base-class', condition && 'conditional-class', className)} />
```

### Responsive Breakpoints

- Mobile: `< 640px`
- Tablet: `640px` – `1024px` (`sm:`)
- Desktop: `> 1024px` (`lg:`)

---

## Animation Conventions

### GSAP + ScrollTrigger Pattern

All scroll-driven animations use GSAP ScrollTrigger. Use `gsap.context()` to scope and clean up animations within components.

```typescript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const MySection = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from('.card', {
      y: 40,
      opacity: 0,
      stagger: 0.1,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
      },
    });
  }, { scope: sectionRef });

  return <section ref={sectionRef}>...</section>;
};
```

### Pinned Section Pattern

```typescript
gsap.timeline({
  scrollTrigger: {
    trigger: sectionRef.current,
    start: 'top top',
    end: '+=130%',
    pin: true,
    scrub: 0.6,
    pinSpacing: true,
  },
});
```

### CSS Animations

Use CSS `@keyframes` for hover states and continuous loops (e.g., countdown pulse, starburst rotation). Do not use GSAP for simple hover transforms.

### Reduced Motion

Always respect `prefers-reduced-motion`. Use the `useReducedMotion` hook to skip or simplify animations.

### Performance Rules

- Animate only `transform` and `opacity` (GPU-accelerated)
- Add `will-change` only on elements actively being animated
- Never animate `width`, `height`, `top`, `left`, `margin`, or `padding`

---

## State Management

No global state manager (no Redux, Zustand, or Context API). State is local to each section component via React hooks.

### localStorage Persistence

Use `useLocalStorage` hook for persisted state:

| Feature | localStorage Key |
|---|---|
| Poll vote selection | stored in `PollSection` |
| Saved garden tips | stored in `GardenTipSection` |
| "Helpful" marks on needs | stored in `NeedsSection` |
| Newsletter subscription status | stored in `ContactSection` |

---

## Content & Data

All content is **hardcoded as constants** inside each section component. There is no CMS, no API, and no data-fetching layer. To update content (events, needs, business ads, stories, etc.), edit the relevant section file directly.

---

## Component Library

shadcn/ui components live in `src/components/ui/`. They are Radix UI primitives styled with Tailwind. Do not modify files in `src/components/ui/` unless adjusting the design system.

To add a new shadcn/ui component (when source is available):
```bash
npx shadcn@latest add <component-name>
```

---

## Key Architectural Patterns

1. **Section-based page layout** — `App.tsx` renders each `*Section` component in order; each section owns its data, animations, and local state.
2. **Custom hooks for reusable logic** — animations, localStorage, countdown, and responsive detection are abstracted into hooks in `src/hooks/`.
3. **No routing** — this is a single-page scroll layout; no React Router.
4. **Static data** — all content is inline constants; no API calls, no async data loading.
5. **PWA-ready** — `manifest.json` provides icons and `standalone` mode for home-screen installation.

---

## SEO & Meta

Defined in `index.html`:
- Open Graph tags for Facebook/social sharing
- Twitter Card tags
- `theme-color: #C31F2B`
- `sitemap.xml` and `robots.txt` at root
- Canonical URL: `https://qualityneighbor.hartlandranch.com/`

---

## Build & Deployment

- **Build output:** `app/dist/` (promoted to repo root in current state)
- **Deployment targets:** GitHub Pages, Vercel, Netlify, or any static host
- **Vite base path:** `'./'` (relative — works for both root and subdirectory hosting)
- **No CI/CD configured** — deploy manually by running `npm run build` and pushing `dist/` contents

---

## Git Conventions

- **Primary branch:** `main`
- **Claude branches:** `claude/<description>-<id>` (e.g., `claude/add-claude-documentation-CrJnC`)
- **Commit style:** short, lowercase, imperative ("new files", "add hero section")
- **No conventional commit format** enforced (no `feat:`, `fix:` prefixes required)
- **Signed commits** are configured for the primary author

---

## Accessibility Checklist

When editing components, ensure:
- [ ] All interactive elements have `aria-label` or visible label text
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators are visible
- [ ] `role` attributes are correct for non-semantic elements
- [ ] Animations are skipped or reduced when `prefers-reduced-motion: reduce`
- [ ] Images have meaningful `alt` text (or `alt=""` for decorative images)

---

## Common Gotchas

- **Source code is not in the working tree** — the `app/src` directory was removed in commit `d3459ea`. Restore from commit `4b4256e` before modifying source.
- **Hashed asset filenames** — `assets/index-BNffZ7b0.css` and `assets/index-gcGG6_V0.js` are the compiled outputs; don't edit them directly.
- **No test suite** — there are no test commands or test files; all verification is manual or via type-checking.
- **GSAP cleanup** — always use `useGSAP()` with a `scope` ref (or return cleanup in `useEffect`) to prevent ScrollTrigger memory leaks.
- **Image paths** — images appear in both `/images/` and the repo root (legacy duplicates). New images should go in `/images/`.
