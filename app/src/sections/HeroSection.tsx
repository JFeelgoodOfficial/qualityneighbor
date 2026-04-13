import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLButtonElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const mastheadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Auto-play entrance animation on load
      const loadTl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // Masthead fade in
      loadTl.fromTo(
        mastheadRef.current,
        { y: -12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
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
        0.6
      );

      // Issue badge
      loadTl.fromTo(
        badgeRef.current,
        { scale: 0.92, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4 },
        0.7
      );

      // CTA button
      loadTl.fromTo(
        ctaRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35 },
        0.85
      );

      // Starburst seal
      loadTl.fromTo(
        sealRef.current,
        { rotate: -12, scale: 0.85, opacity: 0 },
        { rotate: 0, scale: 1, opacity: 1, duration: 0.4 },
        0.9
      );

      // Scroll indicator
      loadTl.fromTo(
        scrollIndicatorRef.current,
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3 },
        1.0
      );

      // Scroll-driven exit animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=90%',
          pin: true,
          scrub: 0.6,
          pinSpacing: true,
          onLeaveBack: () => {
            // Reset all elements to visible when scrolling back to top
            gsap.set([headlineRef.current, subheadRef.current, badgeRef.current, ctaRef.current, scrollIndicatorRef.current, sealRef.current, mastheadRef.current], {
              opacity: 1, x: 0, y: 0, scale: 1, rotate: 0
            });
          }
        }
      });

      // ENTRANCE (0-30%): Hold - elements already visible from load animation
      // SETTLE (30-70%): Hold
      // EXIT (70-100%): Elements exit

      // Headline exit
      scrollTl.fromTo(
        headlineRef.current,
        { y: 0, opacity: 1 },
        { y: '-22vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      // Subheadline exit
      scrollTl.fromTo(
        subheadRef.current,
        { y: 0, opacity: 1 },
        { y: '-18vh', opacity: 0, ease: 'power2.in' },
        0.72
      );

      // Badge exit (left)
      scrollTl.fromTo(
        badgeRef.current,
        { x: 0, opacity: 1 },
        { x: '-10vw', opacity: 0, ease: 'power2.in' },
        0.75
      );

      // Seal exit (right)
      scrollTl.fromTo(
        sealRef.current,
        { x: 0, rotate: 0, opacity: 1 },
        { x: '10vw', rotate: 18, opacity: 0, ease: 'power2.in' },
        0.75
      );

      // CTA exit
      scrollTl.fromTo(
        ctaRef.current,
        { y: 0, opacity: 1 },
        { y: '10vh', opacity: 0, ease: 'power2.in' },
        0.78
      );

      // Scroll indicator exit
      scrollTl.fromTo(
        scrollIndicatorRef.current,
        { y: 0, opacity: 1 },
        { y: '10vh', opacity: 0, ease: 'power2.in' },
        0.78
      );

      // Masthead exit
      scrollTl.fromTo(
        mastheadRef.current,
        { y: 0, opacity: 1 },
        { y: -20, opacity: 0, ease: 'power2.in' },
        0.8
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden z-10"
      style={{ background: 'linear-gradient(180deg, hsl(var(--paper-primary)) 0%, hsl(var(--paper-secondary)) 100%)' }}
    >
      {/* Background vignette image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-vignette.jpg"
          alt="Hartland Ranch neighborhood"
          fetchPriority="high"
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--paper-primary))]/80 via-[hsl(var(--paper-primary))]/60 to-[hsl(var(--paper-primary))]/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Masthead */}
        <div ref={mastheadRef} className="absolute top-[6vh] left-0 right-0 flex flex-col items-center">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-espresso tracking-tight">
            QualityNeighbor
          </h1>
          <div className="w-28 h-0.5 bg-espresso/30 mt-2" />
          <p className="font-mono text-xs uppercase tracking-widest text-warm-brown mt-2">
            Hartland Ranch • Lockhart, TX
          </p>
        </div>

        {/* Hero Headline */}
        <h2
          ref={headlineRef}
          className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-espresso text-center max-w-4xl leading-tight mt-[-4vh]"
        >
          <span className="word inline-block">Neighbors</span>{' '}
          <span className="word inline-block">helping</span>{' '}
          <span className="word inline-block">neighbors.</span>
        </h2>

        {/* Subheadline */}
        <p
          ref={subheadRef}
          className="mt-6 text-lg sm:text-xl text-warm-brown text-center max-w-xl leading-relaxed"
        >
          The monthly newsletter for Hartland Ranch—needs, events, stories, and local gems.
        </p>

        {/* Issue Badge */}
        <div ref={badgeRef} className="mt-10">
          <span className="category-pill-red text-sm px-4 py-2">
            Issue 04 • August 2026
          </span>
        </div>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="vintage-red-btn flex items-center gap-2 text-base"
          >
            <Mail className="w-4 h-4" />
            Subscribe to the newsletter
          </button>
        </div>

        {/* Scroll indicator */}
        <button
          ref={scrollIndicatorRef}
          onClick={() => document.getElementById('at-a-glance')?.scrollIntoView({ behavior: 'smooth' })}
          className="mt-4 text-warm-brown/50 hover:text-warm-brown transition-colors"
          aria-label="Scroll to content"
        >
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>

        {/* Starburst Seal */}
        <div
          ref={sealRef}
          className="absolute right-[8vw] top-[56vh] hidden lg:block"
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
            <text
              x="60"
              y="55"
              textAnchor="middle"
              fill="hsl(var(--cream))"
              className="font-display text-[10px] font-bold"
            >
              Hartland
            </text>
            <text
              x="60"
              y="70"
              textAnchor="middle"
              fill="hsl(var(--cream))"
              className="font-display text-[10px] font-bold"
            >
              Ranch
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}
