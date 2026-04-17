import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Mail, ChevronDown, Calendar, BookOpen, Leaf, Store, Users } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { scrollTo } from '@/lib/scroll';

const now = new Date();
const ISSUE_MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const currentMonthName = ISSUE_MONTH_NAMES[now.getMonth()];
const currentYear = now.getFullYear();
// Issues started January 2026 = issue 1
const issueNumber = (currentYear - 2026) * 12 + (now.getMonth() + 1);
const issueDateline = `Issue ${String(issueNumber).padStart(2, '0')} · ${currentMonthName} ${currentYear} · Hartland Ranch, TX`;

const previewItems = [
  {
    id: 'events',
    label: 'Events',
    labelClass: 'bg-vintage-red/10 text-vintage-red',
    Icon: Calendar,
    title: 'Block Party on Bluebonnet',
    detail: 'Sat, Apr 19 · 5–8pm',
    href: '#events',
  },
  {
    id: 'story',
    label: 'Story',
    labelClass: 'bg-warm-brown/10 text-warm-brown',
    Icon: BookOpen,
    title: 'The Little Free Library That Keeps Giving',
    detail: 'By Marisol V.',
    href: '#story',
  },
  {
    id: 'garden-tip',
    label: 'Tips',
    labelClass: 'bg-emerald-100 text-emerald-800',
    Icon: Leaf,
    title: 'Keep Your Garden Happy in August Heat',
    detail: '4 easy tips',
    href: '#garden-tip',
  },
  {
    id: 'business-ads',
    label: 'Support Local',
    labelClass: 'bg-amber-100 text-amber-800',
    Icon: Store,
    title: 'Shop & hire your neighbors first',
    detail: 'Local businesses',
    href: '#business-ads',
  },
  {
    id: 'community',
    label: 'Community',
    labelClass: 'bg-sky-100 text-sky-800',
    Icon: Users,
    title: 'Schools, churches & civic orgs',
    detail: 'Upcoming events',
    href: '#community-connections',
  },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const datelineRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const loadTl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      loadTl.fromTo(
        datelineRef.current,
        { y: -8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35 },
        0
      );

      const words = headlineRef.current?.querySelectorAll('.word');
      if (words) {
        loadTl.fromTo(
          words,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.04 },
          0.2
        );
      }

      loadTl.fromTo(
        subheadRef.current,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
        0.55
      );

      loadTl.fromTo(
        ctaRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35 },
        0.75
      );

      loadTl.fromTo(
        sealRef.current,
        { rotate: -12, scale: 0.85, opacity: 0 },
        { rotate: 0, scale: 1, opacity: 1, duration: 0.4 },
        0.8
      );

      const cards = previewRef.current?.querySelectorAll('.preview-card');
      if (cards) {
        loadTl.fromTo(
          cards,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.08 },
          0.9
        );
      }

      loadTl.fromTo(
        scrollIndicatorRef.current,
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35 },
        1.1
      );

    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen z-10 flex flex-col"
      style={{ background: 'linear-gradient(180deg, hsl(var(--paper-primary)) 0%, hsl(var(--paper-secondary)) 100%)' }}
    >
      {/* Background vignette image */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <img
          src="/images/hero-vignette.jpg"
          alt="Hartland Ranch neighborhood"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--paper-primary))]/80 via-[hsl(var(--paper-primary))]/60 to-[hsl(var(--paper-primary))]/90" />
      </div>

      {/* Dateline — issue + location, top of section */}
      <div
        ref={datelineRef}
        className="relative z-10 pt-[6vh] flex justify-center"
      >
        <span className="font-mono text-xs uppercase tracking-widest text-warm-brown/70">
          {issueDateline}
        </span>
      </div>

      {/* Center content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Hero Headline */}
        <h1
          ref={headlineRef}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-espresso text-center max-w-4xl leading-tight"
        >
          <span className="word inline-block">Neighbors</span>{' '}
          <span className="word inline-block">helping</span>{' '}
          <span className="word inline-block">neighbors.</span>
        </h1>

        {/* Subheadline */}
        <p
          ref={subheadRef}
          className="mt-5 text-lg sm:text-xl text-warm-brown text-center max-w-xl leading-relaxed"
        >
          The monthly newsletter for Hartland Ranch—events, stories, and local gems.
        </p>

        {/* CTA */}
        <div ref={ctaRef} className="mt-8">
          <button
            onClick={() => scrollTo('#contact')}
            className="vintage-red-btn flex items-center gap-2 text-base"
          >
            <Mail className="w-4 h-4" />
            Subscribe to the newsletter
          </button>
        </div>
      </div>

      {/* Starburst Seal — decorative, desktop only */}
      <div
        ref={sealRef}
        className="absolute right-[8vw] top-1/2 -translate-y-1/2 hidden lg:block z-10"
      >
        <svg
          viewBox="0 0 120 120"
          className="w-28 h-28 animate-rotate-slow"
          style={{ animationDuration: '30s' }}
        >
          <path
            d="M60 0L66.5 25.5L85 10L78 35L105 30L88 48L115 55L90 65L110 85L82 80L95 105L68 90L60 115L52 90L25 105L38 80L10 85L30 65L5 55L32 48L15 30L42 35L35 10L53.5 25.5L60 0Z"
            fill="hsl(var(--vintage-red))"
          />
          <text x="60" y="55" textAnchor="middle" fill="hsl(var(--cream))" fontSize="10" fontWeight="bold">
            Hartland
          </text>
          <text x="60" y="70" textAnchor="middle" fill="hsl(var(--cream))" fontSize="10" fontWeight="bold">
            Ranch
          </text>
        </svg>
      </div>

      {/* Bottom: "In this issue" preview + scroll indicator */}
      <div className="relative z-10 pb-[3.5vh] px-4 sm:px-6 lg:px-8">
        {/* Preview cards */}
        <div ref={previewRef}>
          <p className="font-mono text-xs uppercase tracking-widest text-warm-brown/50 text-center mb-3">
            In this issue
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-3xl mx-auto">
            {previewItems.map(({ id, label, labelClass, Icon, title, detail, href }) => (
              <button
                key={id}
                onClick={() => scrollTo(href)}
                className="preview-card flex-1 flex items-center gap-3 bg-cream/70 backdrop-blur-sm border border-espresso/10 rounded-xl px-4 py-3 text-left hover:bg-cream/90 hover:border-espresso/20 transition-all group"
              >
                <span className={`flex-shrink-0 inline-flex items-center gap-1 text-xs font-mono font-medium px-2 py-0.5 rounded-full ${labelClass}`}>
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-espresso leading-snug truncate group-hover:text-vintage-red transition-colors">
                    {title}
                  </p>
                  <p className="text-xs text-warm-brown/60 mt-0.5">{detail}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollIndicatorRef}
          className="flex flex-col items-center gap-1 mt-4 cursor-pointer"
          onClick={() => scrollTo('#at-a-glance')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') scrollTo('#at-a-glance'); }}
          role="button"
          tabIndex={0}
          aria-label="Scroll down"
        >
          <ChevronDown className="w-5 h-5 text-warm-brown/40 animate-bounce" />
        </div>
      </div>

    </section>
  );
}
