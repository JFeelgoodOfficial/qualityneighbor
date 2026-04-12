# QualityNeighbor — Technical Specification

## 1. Component Inventory

### shadcn/ui Components (pre-installed)
- **Button** — CTAs, actions
- **Card** — content cards, ad cards, event cards
- **Input** — email subscription, forms
- **Badge** — category pills, date pills
- **Accordion** — FAQ section
- **Dialog** — story modal, image lightbox
- **Sheet** — mobile navigation menu
- **Separator** — hairline rules

### Custom Components (to build)
- **StarburstSeal** — SVG badge with text
- **CountdownPill** — live countdown timer
- **PollWidget** — voting interface with results
- **NeedCard** — neighborly needs card
- **EventCard** — event card with image
- **AdCard** — business ad card
- **ShoutoutCard** — fulfilled needs card
- **QuickActionButton** — floating action button with menu
- **PaperOverlay** — grain texture overlay

---

## 2. Animation Implementation Table

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| Hero headline word-by-word reveal | GSAP | SplitText or manual span splitting, staggered y/opacity | Medium |
| Hero starburst rotate/scale entrance | GSAP | fromTo with rotation and scale | Low |
| Hero scroll-driven exit | GSAP ScrollTrigger | scrub timeline, y/opacity transforms | Medium |
| Section 2 cards slide-in | GSAP ScrollTrigger | fromTo x/opacity with scrub | Low |
| Section 3 needs cards stagger | GSAP ScrollTrigger | staggered y/opacity on scroll | Low |
| Section 4 countdown pulse | CSS | @keyframes scale loop | Low |
| Section 5 poll bars scale | GSAP | scaleX transform on reveal | Low |
| Section 6 image parallax | GSAP ScrollTrigger | subtle y transform on scroll | Low |
| Section 7 bullet stagger | GSAP ScrollTrigger | staggered x/opacity | Low |
| Section 8 ad cards entrance | GSAP ScrollTrigger | staggered y/scale/opacity | Low |
| Section 9 spotlight entrance | GSAP ScrollTrigger | y/opacity + scale | Low |
| Section 10 shoutout cards | GSAP ScrollTrigger | staggered y/opacity | Low |
| Section 11 accordion + links | GSAP ScrollTrigger | x/opacity for columns | Low |
| Section 12 form entrance | GSAP ScrollTrigger | y/opacity + scale | Low |
| Card hover lift | CSS | transform translateY + shadow | Low |
| Button hover | CSS | transform translateY | Low |
| Nav scroll hide/show | GSAP | y transform on scroll direction | Low |
| Floating action button expand | GSAP/Framer | scale + stagger menu items | Medium |
| Starburst slow rotation (settle) | CSS | @keyframes rotate loop | Low |

---

## 3. Animation Library Choices

### Primary: GSAP + ScrollTrigger
- All scroll-driven animations
- Pinned section timelines
- Scrubbed transforms

### Secondary: CSS Animations
- Hover states (transform-only)
- Continuous loops (countdown pulse, starburst rotation)
- Simple transitions

### Optional: GSAP Plugins
- **ScrollToPlugin** — nav smooth scroll
- **SplitText** (or custom implementation) — headline word splitting

---

## 4. Project File Structure

```
app/
├── index.html              # Main HTML entry
├── src/
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Main app component
│   ├── App.css             # Global styles + CSS variables
│   ├── components/
│   │   ├── ui/             # shadcn components
│   │   ├── StarburstSeal.tsx
│   │   ├── CountdownPill.tsx
│   │   ├── PollWidget.tsx
│   │   ├── NeedCard.tsx
│   │   ├── EventCard.tsx
│   │   ├── AdCard.tsx
│   │   ├── ShoutoutCard.tsx
│   │   ├── QuickActionButton.tsx
│   │   ├── PaperOverlay.tsx
│   │   ├── Navigation.tsx
│   │   └── MobileMenu.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── AtAGlanceSection.tsx
│   │   ├── NeedsSection.tsx
│   │   ├── EventsSection.tsx
│   │   ├── PollSection.tsx
│   │   ├── StorySection.tsx
│   │   ├── GardenTipSection.tsx
│   │   ├── BusinessAdsSection.tsx
│   │   ├── SpotlightSection.tsx
│   │   ├── ShoutoutsSection.tsx
│   │   ├── ResourcesSection.tsx
│   │   └── ContactSection.tsx
│   ├── hooks/
│   │   ├── useScrollAnimation.ts
│   │   ├── useCountdown.ts
│   │   ├── useLocalStorage.ts
│   │   └── useReducedMotion.ts
│   └── lib/
│       └── utils.ts
├── public/
│   ├── images/             # All generated images
│   ├── paper-grain.png
│   └── fonts/              # If self-hosting
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 5. Dependencies to Install

```bash
# Core (already in template)
# react, react-dom, vite, typescript, tailwindcss

# Animation
npm install gsap @gsap/react

# Icons
npm install lucide-react

# Utilities (already included)
# clsx, tailwind-merge
```

---

## 6. Key Implementation Notes

### Scroll Snap Configuration
```javascript
// Global snap derived from pinned sections
ScrollTrigger.create({
  snap: {
    snapTo: (progress, self) => {
      // Calculate snap targets from pinned section ranges
      // Return snap position
    },
    duration: { min: 0.15, max: 0.35 },
    delay: 0,
    ease: "power2.out"
  }
});
```

### Pinned Section Pattern
```javascript
// Each pinned section
gsap.timeline({
  scrollTrigger: {
    trigger: sectionRef.current,
    start: "top top",
    end: "+=130%",
    pin: true,
    scrub: 0.6,
    pinSpacing: true
  }
});
```

### localStorage Features
- Poll votes (store selection + results)
- Dark mode preference
- Saved tips
- "Helpful" marks on needs

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Performance Optimizations
- will-change on animated elements
- GPU-accelerated transforms only
- Lazy load images below fold
- Respect prefers-reduced-motion
