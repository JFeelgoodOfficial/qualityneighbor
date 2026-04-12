import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HandHeart, Search, Package, MessageCircle, Plus, MapPin, Clock } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

gsap.registerPlugin(ScrollTrigger);

type NeedCategory = 'all' | 'help' | 'offer' | 'find';

interface Need {
  id: string;
  title: string;
  description: string;
  category: Exclude<NeedCategory, 'all'>;
  location?: string;
  time?: string;
  author: string;
}

const needsData: Need[] = [
  {
    id: '1',
    title: 'Need help moving a sofa',
    description: 'Looking for an extra pair of hands to help move a couch from the garage to the living room.',
    category: 'help',
    time: 'Saturday morning',
    author: 'Mike R.',
  },
  {
    id: '2',
    title: 'Offering tomatoes & peppers',
    description: 'Garden overflow! Fresh heirloom tomatoes and bell peppers available for pickup.',
    category: 'offer',
    location: 'Near the trail',
    author: 'Sarah K.',
  },
  {
    id: '3',
    title: 'Lost: set of keys',
    description: 'Lost my keys somewhere near the playground. Has a blue lanyard and house key.',
    category: 'find',
    location: 'Near the playground',
    author: 'Jenny M.',
  },
  {
    id: '4',
    title: 'Looking for a ladder',
    description: 'Need to borrow an extension ladder for a day to clean gutters.',
    category: 'find',
    time: 'Borrow for a day',
    author: 'Tom B.',
  },
  {
    id: '5',
    title: 'Dog walking swap?',
    description: 'Looking for a neighbor to swap dog walking duties on weekday afternoons.',
    category: 'offer',
    time: 'Weekday afternoons',
    author: 'Lisa P.',
  },
  {
    id: '6',
    title: 'Ride to the farmers market',
    description: 'Looking for a ride to the Lockhart Farmers Market this Saturday.',
    category: 'help',
    time: 'Saturday 9am',
    author: 'Carlos D.',
  },
];

const categoryConfig = {
  help: { label: 'Help', icon: HandHeart, color: 'bg-amber-100 text-amber-800' },
  offer: { label: 'Offer', icon: Package, color: 'bg-emerald-100 text-emerald-800' },
  find: { label: 'Find', icon: Search, color: 'bg-blue-100 text-blue-800' },
};

export function NeedsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<NeedCategory>('all');
  const [helpfulIds, setHelpfulIds] = useLocalStorage<string[]>('helpful-needs', []);

  const filteredNeeds = activeFilter === 'all'
    ? needsData
    : needsData.filter(need => need.category === activeFilter);

  const toggleHelpful = (id: string) => {
    setHelpfulIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { y: 18, opacity: 0 },
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

      // Cards stagger animation
      const cards = cardsRef.current?.querySelectorAll('.need-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.08,
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
      id="needs"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-primary))' }}
    >
      {/* Header with filters */}
      <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div className="section-header mb-0">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-espresso pb-4">
            Neighborly Needs
          </h2>
          <div className="w-44 h-0.5 bg-espresso/20" />
          <p className="mt-3 text-warm-brown">
            Post a request, offer a hand, or list something to find.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'help', 'offer', 'find'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-vintage-red text-cream'
                  : 'bg-paper-secondary text-warm-brown hover:bg-warm-brown/20'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Needs Grid */}
      <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNeeds.map((need) => {
          const config = categoryConfig[need.category];
          const Icon = config.icon;
          const isHelpful = helpfulIds.includes(need.id);

          return (
            <div
              key={need.id}
              className="need-card paper-card rounded-xl p-5 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300"
            >
              {/* Category Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {config.label}
                </span>
                <button
                  onClick={() => toggleHelpful(need.id)}
                  className={`text-xs flex items-center gap-1 transition-colors ${
                    isHelpful ? 'text-vintage-red' : 'text-warm-brown/60 hover:text-warm-brown'
                  }`}
                >
                  <HandHeart className={`w-4 h-4 ${isHelpful ? 'fill-current' : ''}`} />
                  {isHelpful ? 'Helpful' : 'Mark helpful'}
                </button>
              </div>

              {/* Content */}
              <h3 className="font-display text-lg font-semibold text-espresso mb-2">
                {need.title}
              </h3>
              <p className="text-sm text-warm-brown leading-relaxed mb-4">
                {need.description}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap gap-3 text-xs text-warm-brown/70 mb-4">
                {need.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {need.location}
                  </span>
                )}
                {need.time && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {need.time}
                  </span>
                )}
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-3 border-t border-espresso/10">
                <span className="text-xs text-warm-brown/60">Posted by {need.author}</span>
                <button className="flex items-center gap-1.5 text-sm text-vintage-red font-medium hover:underline">
                  <MessageCircle className="w-4 h-4" />
                  Reply
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Post a Need CTA */}
      <div className="mt-8">
        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-warm-brown/30 text-warm-brown font-medium hover:border-vintage-red hover:text-vintage-red transition-colors">
          <Plus className="w-5 h-5" />
          Post a need
        </button>
      </div>
    </section>
  );
}
