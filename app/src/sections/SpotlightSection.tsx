import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, ArrowRight, Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function SpotlightSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Card animation
      gsap.fromTo(
        cardRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Portrait animation
      const portrait = cardRef.current?.querySelector('.portrait');
      if (portrait) {
        gsap.fromTo(
          portrait,
          { scale: 0.96, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Q&A lines stagger
      const qaLines = cardRef.current?.querySelectorAll('.qa-line');
      if (qaLines) {
        gsap.fromTo(
          qaLines,
          { x: 18, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top 65%',
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
      id="spotlight"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-primary))' }}
    >
      <div
        ref={cardRef}
        className="max-w-4xl mx-auto paper-card rounded-2xl overflow-hidden"
      >
        <div className="grid md:grid-cols-5 gap-0">
          {/* Portrait */}
          <div className="md:col-span-2 relative h-72 md:h-auto">
            <img
              src="/images/spotlight-portrait.jpg"
              alt="Darnell and Rosa T."
              className="portrait w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/50 via-transparent to-transparent md:bg-gradient-to-r" />

            {/* Label overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-cream fill-cream" />
                <span className="font-mono text-xs uppercase tracking-wider text-cream/90">
                  Neighbor Spotlight
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3 p-6 sm:p-8">
            {/* Red accent line */}
            <div className="w-12 h-1 bg-vintage-red mb-4" />

            <h3 className="font-display text-2xl sm:text-3xl font-semibold text-espresso mb-1">
              Darnell & Rosa T.
            </h3>
            <p className="text-warm-brown mb-6">
              Block captains, Bluebonnet Lane
            </p>

            {/* Q&A */}
            <div className="space-y-5">
              <div className="qa-line">
                <div className="flex items-start gap-3">
                  <Quote className="w-5 h-5 text-vintage-red flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-espresso mb-1">
                      What's your favorite neighborhood tradition?
                    </p>
                    <p className="text-sm text-warm-brown leading-relaxed">
                      "The annual yard sale trail. It's amazing how one person's 
                      'junk' becomes another's treasure. Plus, we all get to catch 
                      up while browsing."
                    </p>
                  </div>
                </div>
              </div>

              <div className="qa-line">
                <div className="flex items-start gap-3">
                  <Quote className="w-5 h-5 text-vintage-red flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-espresso mb-1">
                      One tip for new neighbors?
                    </p>
                    <p className="text-sm text-warm-brown leading-relaxed">
                      "Introduce yourself with a small treat—it opens every door. 
                      We moved in with a plate of cookies and now know everyone 
                      on the block."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 pt-6 border-t border-espresso/10">
              <button className="flex items-center gap-2 text-vintage-red font-medium hover:gap-3 transition-all">
                Nominate a neighbor
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
