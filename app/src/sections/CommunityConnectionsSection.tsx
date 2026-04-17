import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ChevronDown, GraduationCap, Church, Shield, Calendar } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

type OrgType = 'school' | 'church' | 'civic';

interface OrgEvent {
  date: string;
  title: string;
  description: string;
}

interface CommunityOrg {
  id: string;
  name: string;
  type: OrgType;
  subtitle: string;
  events: OrgEvent[];
}

const orgs: CommunityOrg[] = [
  {
    id: 'lockhart-hs',
    name: 'Lockhart High School',
    type: 'school',
    subtitle: 'Lockhart ISD',
    events: [
      { date: 'Apr 18, 2026', title: 'Spring Band & Choir Concert', description: 'Live music in the LHS auditorium. 7pm, free admission.' },
      { date: 'Apr 25, 2026', title: 'Prom 2026', description: 'Caldwell County Fairgrounds, 7pm–midnight. Tickets at the front office.' },
      { date: 'May 23, 2026', title: 'Graduation Ceremony', description: 'Class of 2026 Commencement, 7pm. Gates open at 6pm.' },
    ],
  },
  {
    id: 'lockhart-jh',
    name: 'Lockhart Junior High',
    type: 'school',
    subtitle: 'Lockhart ISD',
    events: [
      { date: 'Apr 22, 2026', title: 'Student Art Show', description: 'Artwork on display in the library. Open house 5–7pm, all welcome.' },
      { date: 'May 1, 2026', title: 'Spring Track Meet', description: 'District track & field at LHS stadium. Spectators welcome.' },
    ],
  },
  {
    id: 'clear-fork',
    name: 'Clear Fork Elementary',
    type: 'school',
    subtitle: 'Lockhart ISD',
    events: [
      { date: 'Apr 24, 2026', title: 'Spring Carnival', description: 'Games, food trucks, and family fun. 5–8pm on the front lawn.' },
      { date: 'May 15, 2026', title: 'Field Day', description: 'Outdoor games and relays for students. Parents welcome to cheer.' },
    ],
  },
  {
    id: 'plum-creek',
    name: 'Plum Creek Elementary',
    type: 'school',
    subtitle: 'Lockhart ISD',
    events: [
      { date: 'Apr 28, 2026', title: 'Scholastic Book Fair', description: 'Library open to families evenings 4–6pm through May 2.' },
      { date: 'May 8, 2026', title: "Mother's Day Tea", description: '2nd graders host a tea for moms & guardians, 9am in the cafeteria.' },
    ],
  },
  {
    id: 'luling-hs',
    name: 'Luling High School',
    type: 'school',
    subtitle: 'Luling ISD',
    events: [
      { date: 'Apr 19, 2026', title: 'Baseball vs. Gonzales', description: 'Home game at Luling ISD stadium, 5pm. Come support the Eagles!' },
      { date: 'May 21, 2026', title: 'Graduation', description: 'Class of 2026 Commencement at LHS Gym, 7pm.' },
    ],
  },
  {
    id: 'first-baptist',
    name: 'First Baptist Church',
    type: 'church',
    subtitle: 'Lockhart, TX',
    events: [
      { date: 'Apr 19, 2026', title: 'Sunday Morning Worship', description: 'Services at 8:30am & 11am. All are welcome.' },
      { date: 'Apr 23, 2026', title: 'Community Potluck Dinner', description: 'Bring a dish to share! Fellowship Hall, 6pm.' },
      { date: 'May 3, 2026', title: 'VBS Registration Opens', description: 'Register kids (K–5th) for Vacation Bible School, June 9–13.' },
    ],
  },
  {
    id: 'first-methodist',
    name: 'First United Methodist',
    type: 'church',
    subtitle: 'Lockhart, TX',
    events: [
      { date: 'Apr 20, 2026', title: 'Community Food Pantry', description: 'Free groceries for those in need. 9am–12pm, side entrance.' },
      { date: 'Apr 27, 2026', title: 'Youth Group Car Wash', description: 'Fundraiser for summer mission trip. $10 suggested, 10am–2pm.' },
    ],
  },
  {
    id: 'st-marys',
    name: "St. Mary's Catholic Church",
    type: 'church',
    subtitle: 'Lockhart, TX',
    events: [
      { date: 'Apr 18, 2026', title: 'Fish Fry Fundraiser', description: 'Parish hall, 5–8pm. $12 adults, $6 kids. All are welcome.' },
      { date: 'May 2, 2026', title: 'First Communion Mass', description: '2nd graders receive First Communion, 10am Mass. Reception to follow.' },
    ],
  },
  {
    id: 'church-of-christ',
    name: 'Lockhart Church of Christ',
    type: 'church',
    subtitle: 'Lockhart, TX',
    events: [
      { date: 'Apr 26, 2026', title: 'Ladies Bible Class', description: 'Open to all women in the community. 10am in the fellowship hall.' },
      { date: 'May 10, 2026', title: 'Community Service Day', description: 'Neighborhood cleanup & repairs for elderly residents. Sign up at the office.' },
    ],
  },
  {
    id: 'grace-church',
    name: 'Grace Church Lockhart',
    type: 'church',
    subtitle: 'Lockhart, TX',
    events: [
      { date: 'Apr 19, 2026', title: 'Sunday Worship', description: 'Contemporary service, 10am. Kids ministry available.' },
      { date: 'May 4, 2026', title: 'Block Party Outreach', description: 'Free food, music, and games for the neighborhood. 4–7pm.' },
    ],
  },
  {
    id: 'vfw-6557',
    name: 'VFW Post 6557',
    type: 'civic',
    subtitle: 'Lockhart, TX',
    events: [
      { date: 'Apr 18, 2026', title: 'Monthly Membership Meeting', description: 'General meeting, 7pm at the post. Veterans and guests welcome.' },
      { date: 'May 26, 2026', title: 'Memorial Day Ceremony', description: 'Annual ceremony at Lockhart City Cemetery, 10am. All encouraged to attend.' },
    ],
  },
  {
    id: 'american-legion',
    name: 'American Legion Post 208',
    type: 'civic',
    subtitle: 'Lockhart, TX',
    events: [
      { date: 'Apr 25, 2026', title: 'Community Bingo Night', description: 'Proceeds support local veterans. Doors open 5:30pm, games start 6pm.' },
      { date: 'May 17, 2026', title: 'Armed Forces Day Parade', description: 'Annual parade through downtown Lockhart. Volunteers needed — call the post.' },
    ],
  },
];

const typeConfig: Record<OrgType, { label: string; Icon: React.ElementType; pillClasses: string; iconClasses: string }> = {
  school: {
    label: 'Schools',
    Icon: GraduationCap,
    pillClasses: 'bg-sky-100 text-sky-700 border-sky-200',
    iconClasses: 'bg-sky-100 text-sky-700',
  },
  church: {
    label: 'Churches',
    Icon: Church,
    pillClasses: 'bg-amber-100 text-amber-700 border-amber-200',
    iconClasses: 'bg-amber-100 text-amber-700',
  },
  civic: {
    label: 'Civic Orgs',
    Icon: Shield,
    pillClasses: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    iconClasses: 'bg-emerald-100 text-emerald-700',
  },
};

const groups: { type: OrgType; heading: string; blurb: string }[] = [
  {
    type: 'school',
    heading: 'Schools',
    blurb: "Caldwell County's public schools are where our kids grow — and where the whole community shows up.",
  },
  {
    type: 'church',
    heading: 'Churches',
    blurb: 'Houses of worship that anchor the calendar and open their doors beyond Sunday.',
  },
  {
    type: 'civic',
    heading: 'Civic Organizations',
    blurb: 'Veterans posts, service clubs, and community groups keeping traditions alive.',
  },
];

function OrgCard({ org }: { org: CommunityOrg }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { Icon, iconClasses } = typeConfig[org.type];

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (open) {
      el.style.height = el.scrollHeight + 'px';
    } else {
      el.style.height = '0px';
    }
  }, [open]);

  return (
    <div
      className={cn(
        'paper-card rounded-2xl overflow-hidden transition-shadow duration-200',
        open ? 'shadow-card-hover' : 'hover:shadow-card-hover'
      )}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 sm:p-5 text-left"
        aria-expanded={open}
      >
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', iconClasses)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-espresso text-sm sm:text-base leading-snug">{org.name}</p>
          <p className="text-xs text-warm-brown/60 mt-0.5">{org.subtitle}</p>
        </div>
        <div className={cn('flex-shrink-0 ml-2 transition-transform duration-300', open && 'rotate-180')}>
          <ChevronDown className="w-4 h-4 text-warm-brown/50" />
        </div>
      </button>

      <div
        ref={bodyRef}
        className="overflow-hidden transition-[height] duration-300 ease-in-out"
        style={{ height: 0 }}
        aria-hidden={!open}
      >
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-espresso/8 pt-3 space-y-3">
          {org.events.length === 0 ? (
            <p className="text-sm text-warm-brown/60 italic">No upcoming events listed.</p>
          ) : (
            org.events.map((ev, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-vintage-red" />
                </div>
                <div>
                  <p className="font-mono text-xs text-warm-brown/60 uppercase tracking-wide mb-0.5">{ev.date}</p>
                  <p className="text-sm font-medium text-espresso leading-snug">{ev.title}</p>
                  <p className="text-xs text-warm-brown leading-relaxed mt-0.5">{ev.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function CommunityConnectionsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = isExpanded ? el.scrollHeight + 'px' : '0px';
  }, [isExpanded]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { x: '-6vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 75%', toggleActions: 'play none none reverse' },
        }
      );

      gsap.fromTo(
        introRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' },
        }
      );

      gsap.fromTo(
        '.org-group',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: { trigger: introRef.current, start: 'bottom 80%', toggleActions: 'play none none reverse' },
        }
      );
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="community-connections"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-primary))' }}
    >
      {/* Header — always visible, acts as toggle */}
      <button
        onClick={() => setIsExpanded(p => !p)}
        className="w-full text-left group mb-2"
        aria-expanded={isExpanded}
        aria-controls="community-body"
      >
        <div ref={headerRef} className="section-header mb-0 flex items-end gap-4">
          <div className="flex-1">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-espresso pb-4 group-hover:text-vintage-red transition-colors">
              Community Connections
            </h2>
            <div className="w-44 h-0.5 bg-espresso/20" />
          </div>
          <div className={`flex-shrink-0 mb-5 w-8 h-8 rounded-full bg-paper-secondary flex items-center justify-center text-warm-brown group-hover:text-vintage-red transition-all ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-warm-brown/70 mt-2 mb-4">
          {isExpanded
            ? 'Schools, churches & civic orgs — click to collapse'
            : `${orgs.length} organizations — schools, churches & civic orgs — click to view`}
        </p>
      </button>

      {/* Collapsible body */}
      <div
        id="community-body"
        ref={bodyRef}
        className="overflow-hidden transition-[height] duration-500 ease-in-out"
        style={{ height: 0 }}
        aria-hidden={!isExpanded}
      >

      <div ref={introRef} className="max-w-2xl mb-12">
        <p className="text-warm-brown leading-relaxed text-base sm:text-lg">
          Strong neighborhoods run on strong institutions. Hartland Ranch is home to people who
          coach Little League, lead Sunday school, staff the VFW, and serve on school boards. Below
          is a living directory of Caldwell County's schools, churches, and civic organizations —
          tap any card to see what's coming up.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          {groups.map(({ type, heading }) => {
            const { Icon, pillClasses } = typeConfig[type];
            return (
              <span
                key={type}
                className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border', pillClasses)}
              >
                <Icon className="w-3.5 h-3.5" />
                {heading}
              </span>
            );
          })}
        </div>
      </div>

      <div className="space-y-12">
        {groups.map(({ type, heading, blurb }) => {
          const groupOrgs = orgs.filter(o => o.type === type);
          const { Icon, iconClasses } = typeConfig[type];
          return (
            <div key={type} className="org-group">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconClasses)}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-espresso">{heading}</h3>
              </div>
              <p className="text-sm text-warm-brown mb-5 ml-11">{blurb}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupOrgs.map(org => (
                  <OrgCard key={org.id} org={org} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      </div>{/* /collapsible body */}
    </section>
  );
}
