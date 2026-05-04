import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// ---- Cleanup React Testing Library after each test ---------------------------
afterEach(() => {
  cleanup()
})

// ---- localStorage mock -------------------------------------------------------
class LocalStorageMock implements Storage {
  private store: Record<string, string> = {}

  get length(): number {
    return Object.keys(this.store).length
  }

  clear(): void {
    this.store = {}
  }

  getItem(key: string): string | null {
    return key in this.store ? this.store[key] : null
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store)
    return keys[index] ?? null
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value)
  }
}

beforeEach(() => {
  const storage = new LocalStorageMock()
  Object.defineProperty(window, 'localStorage', {
    value: storage,
    writable: true,
    configurable: true,
  })
  Object.defineProperty(window, 'sessionStorage', {
    value: new LocalStorageMock(),
    writable: true,
    configurable: true,
  })
})

// ---- matchMedia mock (used for prefers-reduced-motion) -----------------------
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // legacy
      removeListener: vi.fn(), // legacy
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

// ---- IntersectionObserver mock (GSAP ScrollTrigger and lazy patterns) --------
beforeEach(() => {
  class IntersectionObserverMock {
    readonly root: Element | null = null
    readonly rootMargin: string = ''
    readonly thresholds: ReadonlyArray<number> = []
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn().mockReturnValue([])
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserverMock,
  })
})

// ---- ResizeObserver mock -----------------------------------------------------
beforeEach(() => {
  class ResizeObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserverMock,
  })
})

// ---- GSAP mock ---------------------------------------------------------------
// Never load real GSAP in jsdom. It expects a real layout engine.
vi.mock('gsap', () => {
  const tween = {
    kill: vi.fn(),
    pause: vi.fn(),
    play: vi.fn(),
    progress: vi.fn(),
    reverse: vi.fn(),
  }
  const timeline = {
    to: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    fromTo: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    addLabel: vi.fn().mockReturnThis(),
    call: vi.fn().mockReturnThis(),
    pause: vi.fn().mockReturnThis(),
    play: vi.fn().mockReturnThis(),
    kill: vi.fn(),
    progress: vi.fn().mockReturnValue(0),
  }
  const gsap = {
    registerPlugin: vi.fn(),
    to: vi.fn(() => tween),
    from: vi.fn(() => tween),
    fromTo: vi.fn(() => tween),
    set: vi.fn(() => tween),
    timeline: vi.fn(() => timeline),
    context: vi.fn((fn: () => void) => {
      if (typeof fn === 'function') fn()
      return { revert: vi.fn(), kill: vi.fn() }
    }),
    matchMedia: vi.fn(() => ({
      add: vi.fn(),
      revert: vi.fn(),
      kill: vi.fn(),
    })),
    utils: {
      toArray: <T,>(input: T | T[]): T[] => (Array.isArray(input) ? input : [input]),
      clamp: (min: number, max: number, val: number) => Math.max(min, Math.min(max, val)),
    },
    killTweensOf: vi.fn(),
    getProperty: vi.fn(),
  }
  return { default: gsap, gsap }
})

vi.mock('gsap/ScrollTrigger', () => {
  const ScrollTrigger = {
    create: vi.fn(),
    refresh: vi.fn(),
    update: vi.fn(),
    kill: vi.fn(),
    getAll: vi.fn().mockReturnValue([]),
    killAll: vi.fn(),
    config: vi.fn(),
    matchMedia: vi.fn(),
    scrollerProxy: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    register: vi.fn(),
  }
  return { default: ScrollTrigger, ScrollTrigger }
})

vi.mock('@gsap/react', () => ({
  useGSAP: vi.fn((cb: (() => void) | undefined) => {
    if (typeof cb === 'function') cb()
    return { contextSafe: (fn: () => void) => fn }
  }),
}))

// ---- scrollTo / scrollBy mocks (jsdom doesn't implement these) ---------------
beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
  window.scrollBy = vi.fn() as unknown as typeof window.scrollBy
  Element.prototype.scrollIntoView = vi.fn() as unknown as typeof Element.prototype.scrollIntoView
})
