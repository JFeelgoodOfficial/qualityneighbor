import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Calendar, BookOpen, Leaf, Store, Users, ShoppingBag, FileText, Gamepad2 } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { scrollTo } from '@/lib/scroll';

const quickLinks = [
  { label: 'Events',        icon: Calendar,     href: '#events',                color: 'bg-red-50    text-red-700    hover:bg-red-100' },
  { label: 'Story',         icon: BookOpen,     href: '#story',                 color: 'bg-stone-100 text-stone-600 hover:bg-stone-200' },
  { label: 'Tips',          icon: Leaf,         href: '#garden-tip',            color: 'bg-green-50  text-green-700  hover:bg-green-100' },
  { label: 'Support Local', icon: Store,        href: '#business-ads',          color: 'bg-amber-50  text-amber-700  hover:bg-amber-100' },
  { label: 'Community',     icon: Users,        href: '#community-connections', color: 'bg-blue-50   text-blue-700   hover:bg-blue-100' },
  { label: 'Markets',       icon: ShoppingBag,  href: '#farmers-market',        color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
  { label: 'Resources',     icon: FileText,     href: '#resources',             color: 'bg-slate-100 text-slate-600 hover:bg-slate-200' },
  { label: 'Play',          icon: Gamepad2,     href: '#bunny-warren',          color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
];

export function AtAGlanceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { x: '-6vw', opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 75%', toggleActions: 'play none none reverse' },
        }
      );

      const items = gridRef.current?.querySelectorAll('.glance-btn');
      if (items) {
        gsap.fromTo(
          items,
          { y: 16, opacity: 0, scale: 0.95 },
          {
            y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="at-a-glance"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-secondary))' }}
    >
      <div ref={headerRef} className="section-header mb-10">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-espresso pb-4">
          In this issue
        </h2>
        <div className="w-44 h-0.5 bg-espresso/20" />
      </div>

      <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
              className={`glance-btn aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 p-4 transition-all duration-200 active:scale-95 ${link.color}`}
            >
              <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
              <span className="font-medium text-sm sm:text-base text-center leading-tight">
                {link.label}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
