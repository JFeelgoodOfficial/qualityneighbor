import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Mail, ChevronDown, Calendar, BookOpen, Leaf } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

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
  const tornOverlayRef = useRef<HTMLDivElement>(null);

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollDown = () => {
    const el = document.getElementById('at-a-glance');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const prefersReducedMotion = useReducedMotion();

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    if (el) (el as HTMLElement).scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const loadTl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // Dateline fades in from top
      loadTl.fromTo(
        datelineRef.current,
        { y: -8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35 },
        0
      );

      // Headline word-by-word reveal
      const words = headlineRef.current?.querySelectorAll('.word');
      if (words) {
        loadTl.fromTo(
          words,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.04 },
          0.2
        );
      }

      // Subheadline
      loadTl.fromTo(
        subheadRef.current,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
        0.55
      );

      // CTA button
      loadTl.fromTo(
        ctaRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35 },
        0.75
      );

      // Starburst seal
      loadTl.fromTo(
        sealRef.current,
        { rotate: -12, scale: 0.85, opacity: 0 },
        { rotate: 0, scale: 1, opacity: 1, duration: 0.4 },
        0.8
      );

      // Preview cards stagger up from below
      const cards = previewRef.current?.querySelectorAll('.preview-card');
      if (cards) {
        loadTl.fromTo(
          cards,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.08 },
          0.9
        );
      }

      // Scroll indicator
      loadTl.fromTo(
        scrollIndicatorRef.current,
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35 },
        1.1
      );

      // Torn paper reveal — overlay rises from below to cover the hero
      const allRefs = [
        headlineRef.current,
        subheadRef.current,
        datelineRef.current,
        ctaRef.current,
        sealRef.current,
        previewRef.current,
        scrollIndicatorRef.current,
      ];

      gsap.set(tornOverlayRef.current, { visibility: 'hidden' });

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=80%',
          pin: true,
          scrub: 0.6,
          pinSpacing: true,
          onEnter: () => {
            if (tornOverlayRef.current) tornOverlayRef.current.style.visibility = 'visible';
          },
          onLeaveBack: () => {
            gsap.set(allRefs, { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 });
            if (tornOverlayRef.current) tornOverlayRef.current.style.visibility = 'hidden';
          },
        },
      });

      scrollTl.fromTo(
        tornOverlayRef.current,
        { y: '0%' },
        { y: '-100%', ease: 'none' },
        0
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
          Issue 04 · April 2026 · Hartland Ranch, TX
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
            onClick={scrollToContact}
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
                onClick={() => scrollToSection(href)}
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
          onClick={scrollDown}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') scrollDown(); }}
          role="button"
          tabIndex={0}
          aria-label="Scroll down"
        >
          <ChevronDown className="w-5 h-5 text-warm-brown/40 animate-bounce" />
        </div>
      </div>

      {/* Torn paper overlay — rises from below on scroll to reveal next section */}
      <div
        ref={tornOverlayRef}
        className="absolute left-0 w-full z-30 pointer-events-none"
        style={{ top: '100%', height: '100%', visibility: 'hidden' }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          className="absolute w-full"
          style={{
            top: '-59px',
            height: '60px',
            filter: 'drop-shadow(0px -4px 8px rgba(43, 31, 22, 0.15))',
          }}
        >
          <path
            d="M0,28 L12,18 L22,32 L35,12 L48,30 L58,8 L72,24 L82,38 L95,20 L108,35 L118,14 L130,28 L145,6 L158,22 L170,38 L182,16 L196,30 L208,10 L220,26 L234,40 L248,18 L262,34 L272,12 L286,28 L298,5 L312,22 L325,38 L340,14 L355,30 L368,8 L382,24 L395,40 L408,16 L422,32 L435,10 L450,28 L462,42 L476,18 L490,34 L504,12 L518,26 L530,40 L545,20 L558,35 L572,8 L586,28 L598,14 L614,30 L628,5 L642,22 L654,38 L668,16 L682,32 L695,10 L710,26 L724,42 L738,18 L752,34 L766,12 L780,28 L792,5 L806,22 L820,38 L834,16 L848,30 L860,8 L875,24 L888,40 L902,18 L916,35 L930,12 L944,28 L958,6 L972,22 L985,38 L998,14 L1012,30 L1026,8 L1040,26 L1052,40 L1066,18 L1080,34 L1095,12 L1108,28 L1122,5 L1136,22 L1148,38 L1162,16 L1176,30 L1190,10 L1204,26 L1218,42 L1232,18 L1246,35 L1260,12 L1274,28 L1286,6 L1300,22 L1314,38 L1328,16 L1342,32 L1356,10 L1370,28 L1382,42 L1396,18 L1410,34 L1424,14 L1440,28 L1440,60 L0,60 Z"
            fill="hsl(var(--paper-primary))"
          />
        </svg>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, hsl(var(--paper-primary)) 0%, hsl(var(--paper-secondary)) 100%)' }}
        />
      </div>
    </section>
  );
}
