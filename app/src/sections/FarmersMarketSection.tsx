import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ShoppingBasket, MapPin, Clock, CalendarDays } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Market {
  name: string;
  location: string;
  address: string;
  hours: string;
  // dayOfWeek: 0=Sun … 6=Sat
  dayOfWeek: number;
  // months active (1-based): null = year-round
  activeMonths: number[] | null;
  notes?: string;
}

const MARKETS: Market[] = [
  {
    name: 'Caldwell County Farmers Market',
    location: 'Downtown Lockhart Square',
    address: 'S Commerce St, Lockhart, TX 78644',
    hours: '8:00 AM – 12:00 PM',
    dayOfWeek: 6,
    activeMonths: [4, 5, 6, 7, 8, 9, 10, 11],
    notes: 'Produce, eggs, honey, baked goods & local crafts.',
  },
  {
    name: 'Luling Watermelon Thump Market',
    location: 'Luling City Park',
    address: '500 E Pierce St, Luling, TX 78648',
    hours: '9:00 AM – 1:00 PM',
    dayOfWeek: 6,
    activeMonths: [5, 6, 7, 8, 9, 10],
    notes: '~25 min from Hartland Ranch. Worth the drive for watermelons.',
  },
  {
    name: 'San Marcos Farmers Market',
    location: 'Hays County Courthouse Sq.',
    address: '110 N LBJ Dr, San Marcos, TX 78666',
    hours: '8:00 AM – 1:00 PM',
    dayOfWeek: 6,
    activeMonths: null,
    notes: 'Year-round, ~35 min away. Large selection, live music.',
  },
];

function getUpcomingDates(market: Market, count = 3): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates: Date[] = [];
  const cursor = new Date(today);

  while (dates.length < count) {
    if (cursor.getDay() === market.dayOfWeek) {
      const month = cursor.getMonth() + 1;
      const isActive = market.activeMonths === null || market.activeMonths.includes(month);
      if (isActive) dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
    if (cursor.getTime() - today.getTime() > 365 * 24 * 60 * 60 * 1000) break;
  }
  return dates;
}

function formatDate(d: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 7) return 'Next week';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function FarmersMarketSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const marketsWithDates = useMemo(() =>
    MARKETS.map(m => ({ ...m, upcoming: getUpcomingDates(m) })),
    []
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const cards = contentRef.current?.querySelectorAll('.market-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 28, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.45, stagger: 0.1, ease: 'power2.out',
            scrollTrigger: { trigger: section, start: 'top 76%', toggleActions: 'play none none reverse' },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="farmers-market"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-primary))' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="section-header pb-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBasket className="w-4 h-4 text-vintage-red" />
            <span className="font-mono text-xs uppercase tracking-wider text-warm-brown">
              Shop Fresh &amp; Local
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-espresso">
            Farmers Markets Near Hartland Ranch
          </h2>
          <p className="text-warm-brown mt-2 max-w-xl">
            Upcoming market dates auto-update each day. Support your neighbors and
            local growers.
          </p>
        </div>

        <div ref={contentRef} className="space-y-4">
          {marketsWithDates.map((market) => (
            <div key={market.name} className="market-card paper-card rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-semibold text-espresso mb-1">
                    {market.name}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-warm-brown mb-3">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(market.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-vintage-red transition-colors underline-offset-2 hover:underline"
                      >
                        {market.location}
                      </a>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      {market.hours}
                    </span>
                  </div>
                  {market.notes && (
                    <p className="text-sm text-warm-brown/80 italic">{market.notes}</p>
                  )}
                </div>

                {/* Upcoming dates */}
                <div className="flex-shrink-0">
                  <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-warm-brown/60 mb-2">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Upcoming
                  </p>
                  {market.upcoming.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      {market.upcoming.map((d, i) => (
                        <span
                          key={i}
                          className={`font-mono text-sm px-3 py-1 rounded-full ${
                            i === 0
                              ? 'bg-vintage-red text-cream font-medium'
                              : 'bg-paper-secondary text-warm-brown'
                          }`}
                        >
                          {formatDate(d)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-warm-brown/50 italic">Off-season</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
