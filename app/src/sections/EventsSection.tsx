import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Calendar, Clock, MapPin, ArrowRight, CalendarPlus, ChevronDown } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  // ISO date strings for calendar link generation
  startISO: string;
  endISO: string;
}

const eventsData: Event[] = [
  {
    id: '1',
    title: 'Block Party on Bluebonnet',
    date: 'Sat, May 17',
    time: '5–8pm',
    location: 'Bluebonnet Lane',
    description: 'Potluck, music, and a kids\' bike parade. Bring a dish to share!',
    image: '/images/event-block-party.jpg',
    startISO: '20260517T170000',
    endISO: '20260517T200000',
  },
  {
    id: '2',
    title: 'Yard Sale Trail',
    date: 'Sat, May 23',
    time: '8am–12pm',
    location: 'Throughout the neighborhood',
    description: 'Map pickup at the clubhouse. Find treasures from your neighbors!',
    image: '/images/event-yard-sale.jpg',
    startISO: '20260523T080000',
    endISO: '20260523T120000',
  },
  {
    id: '3',
    title: 'Garden Walk & Talk',
    date: 'Sun, May 24',
    time: '9am',
    location: 'Meet at Community Garden',
    description: 'Tour three neighbor gardens + Q&A with local gardening enthusiasts.',
    image: '/images/event-garden-walk.jpg',
    startISO: '20260524T090000',
    endISO: '20260524T110000',
  },
];

function buildGoogleCalendarUrl(event: Event): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${event.startISO}/${event.endISO}`,
    details: event.description,
    location: `${event.location}, Hartland Ranch, Lockhart, TX`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function CountdownPill({ targetDate }: { targetDate: Date }) {
  const { days, hours, minutes, isExpired } = useCountdown(targetDate);

  if (isExpired) {
    return <span className="category-pill">Event started</span>;
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-vintage-red/10 text-vintage-red font-mono text-sm animate-pulse-subtle">
      <Clock className="w-4 h-4" />
      <span>Next event in</span>
      <span className="font-bold">
        {String(days).padStart(2, '0')}d {String(hours).padStart(2, '0')}h {String(minutes).padStart(2, '0')}m
      </span>
    </div>
  );
}

export function EventsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);

  // Next event: Block Party on May 17, 2026
  const nextEventDate = new Date('2026-05-17T17:00:00');

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = isExpanded ? el.scrollHeight + 'px' : '0px';
  }, [isExpanded]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
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

      const cards = cardsRef.current?.querySelectorAll('.event-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { x: '-8vw', opacity: 0, rotate: -0.5 },
          {
            x: 0,
            opacity: 1,
            rotate: 0,
            duration: 0.6,
            stagger: 0.12,
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
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="events"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-secondary))' }}
    >
      {/* Header with countdown — always visible, acts as toggle */}
      <button
        onClick={() => setIsExpanded(p => !p)}
        className="w-full text-left group"
        aria-expanded={isExpanded}
        aria-controls="events-body"
      >
        <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div className="section-header mb-0 flex items-end gap-4">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-espresso pb-4 group-hover:text-vintage-red transition-colors">
                Upcoming Events
              </h2>
              <div className="w-44 h-0.5 bg-espresso/20" />
            </div>
            <div className={`flex-shrink-0 mb-5 w-8 h-8 rounded-full bg-paper-primary flex items-center justify-center text-warm-brown group-hover:text-vintage-red transition-all ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
          <CountdownPill targetDate={nextEventDate} />
        </div>
        <p className="text-sm text-warm-brown/70 mb-2">
          {isExpanded ? 'Click to collapse' : `${eventsData.length} events this month — click to view`}
        </p>
      </button>

      {/* Collapsible body */}
      <div
        id="events-body"
        ref={bodyRef}
        className="overflow-hidden transition-[height] duration-500 ease-in-out"
        style={{ height: 0 }}
        aria-hidden={!isExpanded}
      >
      <div className="pt-6">

      {/* Events Grid */}
      <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventsData.map((event) => (
          <div
            key={event.id}
            className="event-card paper-card rounded-2xl overflow-hidden group hover:shadow-card-hover transition-all duration-300"
          >
            {/* Image */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <span className="category-pill bg-cream/90 text-espresso backdrop-blur-sm">
                  <Calendar className="w-3 h-3 mr-1 inline-block" />
                  {event.date}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-display text-lg font-semibold text-espresso mb-2 group-hover:text-vintage-red transition-colors">
                {event.title}
              </h3>

              <div className="flex flex-wrap gap-2 text-xs text-warm-brown mb-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {event.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {event.location}
                </span>
              </div>

              <p className="text-sm text-warm-brown leading-relaxed mb-4">
                {event.description}
              </p>

              <a
                href={buildGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-vintage-red font-medium hover:gap-2 transition-all"
                aria-label={`Add ${event.title} to Google Calendar`}
              >
                <CalendarPlus className="w-4 h-4" />
                Add to calendar
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* View All CTA */}
      <div className="mt-8 text-center">
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 text-vintage-red font-medium hover:underline"
        >
          Get event updates in your inbox
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
      </div>{/* /pt-6 */}
      </div>{/* /collapsible body */}
    </section>
  );
}
