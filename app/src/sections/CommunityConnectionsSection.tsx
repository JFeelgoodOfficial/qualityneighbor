import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ChevronDown, GraduationCap, Church, Shield } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

type OrgType = 'school' | 'church' | 'civic';

interface CommunityOrg {
  id: string;
  name: string;
  type: OrgType;
  subtitle: string;
}

const orgs: CommunityOrg[] = [
  { id: 'lockhart-hs',      name: 'Lockhart High School',       type: 'school', subtitle: 'Lockhart ISD' },
  { id: 'lockhart-jh',      name: 'Lockhart Junior High',       type: 'school', subtitle: 'Lockhart ISD' },
  { id: 'clear-fork',       name: 'Clear Fork Elementary',      type: 'school', subtitle: 'Lockhart ISD' },
  { id: 'plum-creek',       name: 'Plum Creek Elementary',      type: 'school', subtitle: 'Lockhart ISD' },
  { id: 'luling-hs',        name: 'Luling High School',         type: 'school', subtitle: 'Luling ISD' },
  { id: 'first-baptist',    name: 'First Baptist Church',       type: 'church', subtitle: 'Lockhart, TX' },
  { id: 'first-methodist',  name: 'First United Methodist',     type: 'church', subtitle: 'Lockhart, TX' },
  { id: 'st-marys',         name: "St. Mary's Catholic Church", type: 'church', subtitle: 'Lockhart, TX' },
  { id: 'church-of-christ', name: 'Lockhart Church of Christ',  type: 'church', subtitle: 'Lockhart, TX' },
  { id: 'grace-church',     name: 'Grace Church Lockhart',      type: 'church', subtitle: 'Lockhart, TX' },
  { id: 'vfw-6557',         name: 'VFW Post 6557',              type: 'civic',  subtitle: 'Lockhart, TX' },
  { id: 'american-legion',  name: 'American Legion Post 208',   type: 'civic',  subtitle: 'Lockhart, TX' },
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
  const { Icon, iconClasses } = typeConfig[org.type];

  return (
    <div className="paper-card rounded-2xl overflow-hidden hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-center gap-3 p-4 sm:p-5">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', iconClasses)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-espresso text-sm sm:text-base leading-snug">{org.name}</p>
          <p className="text-xs text-warm-brown/60 mt-0.5">{org.subtitle}</p>
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
          is a directory of Caldwell County's schools, churches, and civic organizations.
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
