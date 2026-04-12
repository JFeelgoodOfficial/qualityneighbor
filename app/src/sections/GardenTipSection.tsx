import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Droplets, Sun, Shovel, Scissors, Bookmark, Check } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

gsap.registerPlugin(ScrollTrigger);

const tips = [
  {
    icon: Droplets,
    text: 'Water early (5–8am) to reduce evaporation and help roots absorb moisture.',
  },
  {
    icon: Shovel,
    text: 'Mulch now to lock in moisture and keep soil temperatures stable.',
  },
  {
    icon: Sun,
    text: 'Shade tender plants during peak sun hours with cloth or shade cloth.',
  },
  {
    icon: Scissors,
    text: 'Harvest herbs before they bolt to enjoy the best flavor.',
  },
];

export function GardenTipSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useLocalStorage<boolean>('garden-tip-saved', false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Card animation
      gsap.fromTo(
        cardRef.current,
        { y: 45, opacity: 0 },
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

      // Bullets stagger
      const bullets = cardRef.current?.querySelectorAll('.tip-bullet');
      if (bullets) {
        gsap.fromTo(
          bullets,
          { x: -12, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top 70%',
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
      id="garden-tip"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-primary))' }}
    >
      <div
        ref={cardRef}
        className="max-w-4xl mx-auto paper-card rounded-2xl overflow-hidden"
      >
        <div className="grid md:grid-cols-5 gap-0">
          {/* Image */}
          <div className="md:col-span-2 relative h-64 md:h-auto">
            <img
              src="/images/garden-tip.jpg"
              alt="Watering a tomato plant"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 to-transparent md:bg-gradient-to-r" />
          </div>

          {/* Content */}
          <div className="md:col-span-3 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="category-pill bg-emerald-100 text-emerald-800">
                Garden & Home
              </span>
              <button
                onClick={() => setSaved(!saved)}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  saved ? 'text-vintage-red' : 'text-warm-brown hover:text-espresso'
                }`}
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    Save for later
                  </>
                )}
              </button>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-semibold text-espresso mb-4">
              Keep your garden happy in August heat
            </h3>

            <p className="text-warm-brown mb-6">
              Texas summers are tough on gardens. Here are four simple tips to help 
              your plants thrive through the hottest month:
            </p>

            <ul className="space-y-3">
              {tips.map((tip, index) => (
                <li
                  key={index}
                  className="tip-bullet flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-paper-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <tip.icon className="w-4 h-4 text-warm-brown" />
                  </div>
                  <span className="text-sm text-espresso leading-relaxed">{tip.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
