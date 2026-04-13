import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, MessageSquare, ShoppingBag, Wrench } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface BusinessAd {
  id: string;
  name: string;
  tagline: string;
  cta: string;
  image: string;
  icon: typeof MessageSquare;
}

const adsData: BusinessAd[] = [
  {
    id: '1',
    name: 'Lockhart Lawn Care',
    tagline: 'Mowing, edging, cleanup. Weekly or bi-weekly service.',
    cta: 'Get a quote',
    image: '/images/ad-lawn-care.jpg',
    icon: Wrench,
  },
  {
    id: '2',
    name: 'Baked by Bex',
    tagline: 'Sourdough, cookies, custom orders for any occasion.',
    cta: 'Order',
    image: '/images/ad-bakery.jpg',
    icon: ShoppingBag,
  },
  {
    id: '3',
    name: 'Hartland Handyman',
    tagline: 'Small repairs, installs, painting. No job too small.',
    cta: 'Book',
    image: '/images/ad-handyman.jpg',
    icon: Wrench,
  },
];

export function BusinessAdsSection() {
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
      const cards = cardsRef.current?.querySelectorAll('.ad-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
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
      id="business-ads"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-secondary))' }}
    >
      {/* Header */}
      <div ref={headerRef} className="section-header mb-10">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-espresso pb-4">
          Local Business Ads
        </h2>
        <div className="w-44 h-0.5 bg-espresso/20" />
        <p className="mt-3 text-warm-brown">
          Support neighbor-owned shops and side hustles.
        </p>
      </div>

      {/* Ads Grid */}
      <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {adsData.map((ad) => {
          const Icon = ad.icon;
          return (
            <div
              key={ad.id}
              className="ad-card paper-card rounded-2xl overflow-hidden group hover:shadow-card-hover transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={ad.image}
                  alt={ad.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3">
                  <div className="w-10 h-10 rounded-full bg-cream/90 backdrop-blur-sm flex items-center justify-center">
                    <Icon className="w-5 h-5 text-espresso" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-espresso mb-1 group-hover:text-vintage-red transition-colors">
                  {ad.name}
                </h3>
                <p className="text-sm text-warm-brown leading-relaxed mb-4">
                  {ad.tagline}
                </p>
                <button className="flex items-center gap-1.5 text-sm text-vintage-red font-medium hover:gap-2 transition-all">
                  {ad.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Claim Ad CTA */}
      <div className="mt-10 text-center">
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-paper-secondary/50">
          <div>
            <p className="font-display text-lg font-semibold text-espresso">
              Have a side hustle?
            </p>
            <p className="text-sm text-warm-brown">
              Claim a free ad spot in next month's newsletter.
            </p>
          </div>
          <button className="vintage-red-btn whitespace-nowrap">
            Claim a free ad
          </button>
        </div>
      </div>
    </section>
  );
}
