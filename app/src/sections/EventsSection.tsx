import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Calendar, Clock, MapPin, ArrowRight, CalendarPlus } from 'lucide-react';
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
    date: 'Sat, Apr 19',
    time: '5–8pm',
    location: 'Bluebonnet Lane',
    description: 'Potluck, music, and a kids\' bike parade. Bring a dish to share!',
    image: '/images/event-block-party.jpg',
    startISO: '20260419T170000',
    endISO: '20260419T200000',
  },
  {
    id: '2',
    title: 'Yard Sale Trail',
    date: 'Sat, Apr 26',
    time: '8am–12pm',
    location: 'Throughout the neighborhood',
    description: 'Map pickup at the clubhouse. Find treasures from your neighbors!',
    image: '/images/event-yard-sale.jpg',
    startISO: '20260426T080000',
    endISO: '20260426T120000',
  },
  {
    id: '3',
    title: 'Garden Walk & Talk',
    date: 'Sun, Apr 27',
    time: '9am',
    location: 'Meet at Community Garden',
    description: 'Tour three neighbor gardens + Q&A with local gardening enthusiasts.',
    image: '/images/event-garden-walk.jpg',
    startISO: '20260427T090000',
    endISO: '20260427T110000',
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
  const prefersReducedMotion = useReducedMotion();

  // Next event: Block Party on Apr 19, 2026
  const nextEventDate = new Date('2026-04-19T17:00:00');

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
      {/* Header with countdown */}
      <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div className="section-header mb-0">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-espresso pb-4">
            Upcoming Events
          </h2>
          <div className="w-44 h-0.5 bg-espresso/20" />
        </div>
        <CountdownPill targetDate={nextEventDate} />
      </div>

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
    </section>
  );
}
