import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Calendar, Leaf, Store, Star } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const quickLinks = [
  { label: 'Upcoming Events', icon: Calendar, href: '#events' },
  { label: 'Garden Tip', icon: Leaf, href: '#garden-tip' },
  { label: 'Local Ads', icon: Store, href: '#business-ads' },
  { label: 'Neighbor Spotlight', icon: Star, href: '#spotlight' },
];

export function AtAGlanceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { x: '-6vw', opacity: 0 },
        {
          x: 0,
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

      // Featured card animation
      gsap.fromTo(
        featuredRef.current,
        { x: '-10vw', opacity: 0, rotate: -1 },
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

      // Quick links card animation
      gsap.fromTo(
        linksRef.current,
        { x: '10vw', opacity: 0, rotate: 1 },
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

      // Stagger link items
      const linkItems = linksRef.current?.querySelectorAll('.link-item');
      if (linkItems) {
        gsap.fromTo(
          linkItems,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.06,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: linksRef.current,
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
      id="at-a-glance"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-secondary))' }}
    >
      {/* Section Header */}
      <div ref={headerRef} className="section-header mb-10">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-espresso pb-4">
          This month at a glance
        </h2>
        <div className="w-44 h-0.5 bg-espresso/20" />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Featured Story Card */}
        <div
          ref={featuredRef}
          className="lg:col-span-3 paper-card rounded-2xl overflow-hidden group cursor-pointer hover:shadow-card-hover transition-shadow duration-300"
        >
          <div className="relative h-56 sm:h-64 lg:h-72 overflow-hidden">
            <img
              src="/images/story-library-1.jpg"
              alt="Little Free Library"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4">
              <span className="category-pill-red">Featured Story</span>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold text-espresso mb-3 group-hover:text-vintage-red transition-colors">
              The Little Free Library That Keeps Giving
            </h3>
            <p className="text-warm-brown leading-relaxed mb-4">
              How one corner book swap became a daily stop for neighbors—and what's next for our community reading spot.
            </p>
            <a
              href="#story"
              className="inline-flex items-center gap-2 text-vintage-red font-medium hover:gap-3 transition-all"
            >
              Read the story
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links Card */}
        <div
          ref={linksRef}
          className="lg:col-span-2 paper-card rounded-2xl p-6 sm:p-8"
        >
          <h3 className="font-display text-xl font-semibold text-espresso mb-6">
            In this issue
          </h3>
          <nav className="space-y-3">
            {quickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="link-item flex items-center gap-3 p-3 rounded-xl hover:bg-paper-secondary/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-paper-secondary flex items-center justify-center group-hover:bg-vintage-red group-hover:text-cream transition-colors">
                  <link.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-espresso group-hover:text-vintage-red transition-colors">
                  {link.label}
                </span>
                <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
