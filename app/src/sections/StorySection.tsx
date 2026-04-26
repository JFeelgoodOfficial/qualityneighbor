import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, User, Calendar, ChevronUp } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function StorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);
  const fullStoryRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [storyExpanded, setStoryExpanded] = useState(false);

  useEffect(() => {
    const el = fullStoryRef.current;
    if (!el) return;
    el.style.height = storyExpanded ? el.scrollHeight + 'px' : '0px';
  }, [storyExpanded]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Text column animation
      gsap.fromTo(
        textRef.current,
        { x: '-8vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Images animation
      gsap.fromTo(
        imagesRef.current,
        { x: '10vw', opacity: 0, rotate: 1.5 },
        {
          x: 0,
          opacity: 1,
          rotate: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Subtle parallax on images
      const images = imagesRef.current?.querySelectorAll('img');
      if (images && images.length > 0) {
        gsap.to(images, {
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="story"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-secondary))' }}
    >
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start max-w-7xl mx-auto">
        {/* Text Column */}
        <div ref={textRef} className="order-2 lg:order-1">
          <span className="category-pill-red mb-4 inline-block">Featured Story</span>

          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-espresso mb-4 leading-tight">
            The Little Free Library That Keeps Giving
          </h2>

          <div className="flex flex-wrap gap-4 text-sm text-warm-brown mb-6">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              By Marisol V.
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              August 2026
            </span>
          </div>

          <div className="space-y-4 text-warm-brown leading-relaxed mb-6">
            <p>
              It started with one shelf and a handwritten note: "Take a book, leave a book."
              Three years later, the little wooden library on the corner of Bluebonnet and
              Meadowbrook has become something of a community landmark.
            </p>
            <p>
              "I see neighbors there every morning," says Darnell Thompson, who lives across
              the street. "Dog walkers, kids on their way to school, parents with strollers—
              everyone stops to peek inside."
            </p>
            <p>
              The library's curator, Marisol Vega, has kept the collection fresh with
              everything from mystery novels to cookbooks to children's picture books.
              She even added a small notebook where neighbors can leave recommendations
              and reviews.
            </p>
          </div>

          {/* Expandable full story */}
          <div
            ref={fullStoryRef}
            className="overflow-hidden transition-[height] duration-500 ease-in-out"
            style={{ height: 0 }}
            aria-hidden={!storyExpanded}
          >
            <div className="space-y-4 text-warm-brown leading-relaxed mb-6">
              <p>
                The notebook — a spiral-bound one with a red cover — has filled up twice already.
                Marisol replaced it each time, keeping the old ones in a small binder she calls
                "The Neighborhood Record." Flip through the pages and you'll find everything from
                two-sentence reviews to heartfelt thank-you notes left by strangers.
              </p>
              <p>
                "People write the sweetest things," she laughs. "Someone left a note saying the
                library helped them through a really hard month. That made everything worth it."
              </p>
              <p>
                Over the years the library has taken on a seasonal personality. Summer brings
                beach reads and kids' chapter books. Fall fills the shelves with Texas history
                and cozy mysteries. December brings holiday classics — and, mysteriously, a
                small wrapped gift tucked inside each year by an anonymous donor.
              </p>
              <p>
                The original single shelf has grown into a proper cedar cabinet, built and
                donated by neighbor Carlos Reyes. A small solar-powered light keeps it visible
                after dark. Marisol says she's never had to ask for donations — books simply
                appear, and the collection stays full.
              </p>
              <p>
                What started as a small gesture has become proof that big community spirit
                doesn't require a big budget. If you'd like to donate books or help maintain
                the library, reach out to Marisol through the Contact section below.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStoryExpanded(e => !e)}
            className="inline-flex items-center gap-2 text-vintage-red font-medium hover:gap-3 transition-all"
            aria-expanded={storyExpanded}
          >
            {storyExpanded ? (
              <>
                Show less
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Read the full story
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Images Column */}
        <div ref={imagesRef} className="order-1 lg:order-2 relative">
          <div className="relative">
            {/* Main Image */}
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-card">
              <img
                src="/images/story-library-1.jpg"
                alt="Little Free Library on the sidewalk"
                loading="lazy"
                className="w-full h-64 sm:h-80 object-cover"
              />
            </div>

            {/* Secondary Image (overlapping) */}
            <div className="absolute -bottom-8 -left-4 sm:-left-8 w-2/3 z-20 rounded-2xl overflow-hidden shadow-card border-4 border-cream">
              <img
                src="/images/story-library-2.jpg"
                alt="Books inside the library"
                loading="lazy"
                className="w-full h-40 sm:h-48 object-cover"
              />
            </div>

            {/* Decorative element */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-vintage-red/10 rounded-full -z-10" />
            <div className="absolute -bottom-4 right-1/4 w-16 h-16 bg-paper-secondary rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
