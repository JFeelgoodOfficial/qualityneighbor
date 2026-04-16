import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart, ArrowRight, User } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Shoutout {
  id: string;
  message: string;
  date: string;
  author: string;
}

const shoutoutsData: Shoutout[] = [
  {
    id: '1',
    message: 'Thanks to Jenna for the moving help! You made the day so much easier.',
    date: 'Aug 2',
    author: 'Marcus H.',
  },
  {
    id: '2',
    message: "Tom's ladder saved the weekend. gutter cleaning complete!",
    date: 'Jul 28',
    author: 'Sarah L.',
  },
  {
    id: '3',
    message: 'Shoutout to Bex for the birthday cookies. They were incredible!',
    date: 'Jul 24',
    author: 'The Chen Family',
  },
];

export function ShoutoutsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Cards stagger
      const cards = cardsRef.current?.querySelectorAll('.shoutout-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="shoutouts"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-secondary))' }}
    >
      {/* Header */}
      <div ref={headerRef} className="section-header mb-10">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-espresso pb-4">
          Shoutouts
        </h2>
        <div className="w-44 h-0.5 bg-espresso/20" />
        <p className="mt-3 text-warm-brown">
          Celebrating the little wins that make our community special.
        </p>
      </div>

      {/* Shoutouts Grid */}
      <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {shoutoutsData.map((shoutout) => (
          <div
            key={shoutout.id}
            className="shoutout-card paper-card rounded-xl p-5 hover:shadow-card-hover transition-all duration-300"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-vintage-red/10 flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-vintage-red" />
              </div>
              <div>
                <p className="text-espresso leading-relaxed">
                  "{shoutout.message}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-espresso/10">
              <div className="flex items-center gap-2 text-sm text-warm-brown">
                <User className="w-4 h-4" />
                {shoutout.author}
              </div>
              <span className="font-mono text-xs text-warm-brown/60">
                {shoutout.date}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Share Shoutout CTA */}
      <div className="mt-8 text-center">
        <button className="inline-flex items-center gap-2 text-vintage-red font-medium hover:underline">
          Share a shoutout
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
