import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Calendar, ChevronUp } from 'lucide-react';
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
            The Mysterious Runner
          </h2>

          <div className="flex flex-wrap gap-4 text-sm text-warm-brown mb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              May 2026
            </span>
          </div>

          <div className="space-y-4 text-warm-brown leading-relaxed mb-6">
            <p>
              Every morning before the sun rises, a lone figure can be seen pounding the pavement,
              breath misting in the early air. No one knows his name... he never stops to chat,
              never posts his times online. But over the past few months, this anonymous runner
              has become a quiet fixture in our community.
            </p>
            <p>
              Observers have noticed the transformation. His stride has grown longer, more confident.
              His pace, once steady, now has a sharpened edge. Rumor has it he's been training for
              a personal goal, one that requires months of discipline, grit, and early alarms.
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
                There's something inspiring about his journey. He doesn't run for applause or
                recognition. He runs to get better. To push limits. To beat yesterday's time.
                In a world of likes and hashtags, his silent commitment is a refreshing reminder:
                progress doesn't always need an audience.
              </p>
              <p>
                Whoever he is, we're rooting for him. And maybe, just maybe, his quiet pursuit
                will nudge a few more of us to lace up and chase our own goals.
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
                src="/images/story-runner.jpg"
                alt="A lone runner on a misty morning road"
                loading="lazy"
                className="w-full h-72 sm:h-96 object-cover object-top"
              />
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-vintage-red/10 rounded-full -z-10" />
            <div className="absolute -bottom-4 right-1/4 w-16 h-16 bg-paper-secondary rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
