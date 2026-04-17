import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Stethoscope, Eye, Smile, MapPin, Phone, ChevronDown, CheckCircle, Clock, ChevronUp } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type Category = 'All' | 'Medical' | 'Dental' | 'Vision';

interface Provider {
  name: string;
  specialty: string;
  category: Exclude<Category, 'All'>;
  address: string;
  phone: string;
  acceptingNew: boolean;
  hours?: string;
  notes?: string;
}

// ── Update this list as providers change ─────────────────────────────────────
const PROVIDERS: Provider[] = [
  // ── Medical ────────────────────────────────────────────────────────────────
  {
    name: 'Ascension Seton Edgar B. Davis',
    specialty: 'Hospital — Emergency & Inpatient',
    category: 'Medical',
    address: '130 Hays St, Lockhart, TX 78644',
    phone: '(512) 398-7700',
    acceptingNew: true,
    hours: 'Emergency: 24/7',
    notes: 'Full-service community hospital. Level IV trauma center.',
  },
  {
    name: 'Lockhart Family Healthcare',
    specialty: 'Family Medicine',
    category: 'Medical',
    address: '1702 S Commerce St, Lockhart, TX 78644',
    phone: '(512) 398-5461',
    acceptingNew: true,
    hours: 'Mon–Fri 8am–5pm',
  },
  {
    name: 'Clinica de Salud del Valle de Salinas',
    specialty: 'Primary Care / FQHC',
    category: 'Medical',
    address: '801 S Main St, Lockhart, TX 78644',
    phone: '(512) 398-2141',
    acceptingNew: true,
    hours: 'Mon–Fri 7:30am–5pm',
    notes: 'Federally Qualified Health Center. Sliding-scale fees available.',
  },
  {
    name: 'Luling Regional Medical Center',
    specialty: 'Hospital / Primary Care',
    category: 'Medical',
    address: '200 Memorial Dr, Luling, TX 78648',
    phone: '(830) 875-3671',
    acceptingNew: true,
    hours: 'Emergency: 24/7',
    notes: '~25 min from Hartland Ranch.',
  },
  {
    name: 'Caldwell County Health Department',
    specialty: 'Public Health / Immunizations',
    category: 'Medical',
    address: '610 N Colorado St, Lockhart, TX 78644',
    phone: '(512) 398-6571',
    acceptingNew: true,
    hours: 'Mon–Fri 8am–5pm',
    notes: 'Vaccines, WIC, family planning, and public health services.',
  },
  {
    name: 'Texas Health & Human Services',
    specialty: 'Behavioral Health / Mental Health',
    category: 'Medical',
    address: '1911 S Commerce St, Lockhart, TX 78644',
    phone: '(512) 398-6500',
    acceptingNew: true,
    hours: 'Mon–Fri 8am–5pm',
  },
  // ── Dental ────────────────────────────────────────────────────────────────
  {
    name: 'Lockhart Dental',
    specialty: 'General Dentistry',
    category: 'Dental',
    address: '302 W San Antonio St, Lockhart, TX 78644',
    phone: '(512) 398-5422',
    acceptingNew: true,
    hours: 'Mon–Thu 8am–5pm, Fri 8am–12pm',
  },
  {
    name: 'Family Dental of Lockhart',
    specialty: 'Family & Cosmetic Dentistry',
    category: 'Dental',
    address: '1515 S Commerce St, Lockhart, TX 78644',
    phone: '(512) 398-3600',
    acceptingNew: true,
    hours: 'Mon–Fri 8am–5pm',
    notes: 'Accepts most major insurance plans.',
  },
  {
    name: 'Smile Zone Pediatric Dentistry',
    specialty: 'Pediatric Dentistry',
    category: 'Dental',
    address: '215 Bowie St, Lockhart, TX 78644',
    phone: '(512) 398-7800',
    acceptingNew: true,
    hours: 'Mon–Fri 8am–4pm',
    notes: 'Children and teens only.',
  },
  {
    name: 'Central Texas Orthodontics',
    specialty: 'Orthodontics / Braces',
    category: 'Dental',
    address: '1820 S Commerce St, Lockhart, TX 78644',
    phone: '(512) 398-4400',
    acceptingNew: true,
    hours: 'Mon–Thu 8am–5pm',
  },
  // ── Vision ────────────────────────────────────────────────────────────────
  {
    name: 'Lockhart Eye Care',
    specialty: 'Optometry',
    category: 'Vision',
    address: '710 S Commerce St, Lockhart, TX 78644',
    phone: '(512) 398-2020',
    acceptingNew: true,
    hours: 'Mon–Fri 9am–5pm, Sat 9am–12pm',
    notes: 'Glasses, contacts, and eye exams.',
  },
  {
    name: 'Dr. Linda Hooper, O.D.',
    specialty: 'Optometry',
    category: 'Vision',
    address: '1302 S Commerce St, Lockhart, TX 78644',
    phone: '(512) 398-8855',
    acceptingNew: false,
    hours: 'Tue–Fri 9am–4pm',
    notes: 'Currently not accepting new patients.',
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  All: Stethoscope,
  Medical: Stethoscope,
  Dental: Smile,
  Vision: Eye,
};

const CATEGORY_COLORS: Record<Exclude<Category, 'All'>, string> = {
  Medical: 'bg-sky-100 text-sky-800',
  Dental: 'bg-violet-100 text-violet-800',
  Vision: 'bg-emerald-100 text-emerald-800',
};

export function HealthDirectorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [isExpanded, setIsExpanded] = useState(false);

  const filtered = activeCategory === 'All'
    ? PROVIDERS
    : PROVIDERS.filter(p => p.category === activeCategory);

  const counts: Record<Category, number> = {
    All: PROVIDERS.length,
    Medical: PROVIDERS.filter(p => p.category === 'Medical').length,
    Dental: PROVIDERS.filter(p => p.category === 'Dental').length,
    Vision: PROVIDERS.filter(p => p.category === 'Vision').length,
  };

  const categories: Category[] = ['All', 'Medical', 'Dental', 'Vision'];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const cards = gridRef.current?.querySelectorAll('.provider-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 20, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out',
            scrollTrigger: { trigger: section, start: 'top 76%', toggleActions: 'play none none reverse' },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion, activeCategory]);

  return (
    <section
      ref={sectionRef}
      id="health-directory"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-secondary))' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header + toggle */}
        <button
          onClick={() => setIsExpanded(prev => !prev)}
          className="w-full text-left group"
          aria-expanded={isExpanded}
          aria-controls="health-directory-body"
        >
          <div className="section-header pb-6 mb-0 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-vintage-red" />
                <span className="font-mono text-xs uppercase tracking-wider text-warm-brown">
                  Health &amp; Wellness
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-espresso group-hover:text-vintage-red transition-colors">
                Local Medical Directory
              </h2>
              <p className="text-warm-brown mt-1 max-w-xl">
                Healthcare providers serving Lockhart and Hartland Ranch.{' '}
                <span className="text-vintage-red font-medium">
                  {isExpanded ? 'Click to collapse' : `${PROVIDERS.length} providers — click to view`}
                </span>
              </p>
            </div>
            <div className="flex-shrink-0 mt-1 w-9 h-9 rounded-full bg-paper-primary flex items-center justify-center text-warm-brown group-hover:text-vintage-red group-hover:bg-paper-secondary transition-all">
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </button>

        {/* Collapsible body */}
        <div
          id="health-directory-body"
          className="overflow-hidden transition-all duration-500 ease-in-out"
          style={{ maxHeight: isExpanded ? '9999px' : '0px', opacity: isExpanded ? 1 : 0 }}
        >
        <div className="pt-8">

        {/* Category filter */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {/* Dropdown — mobile */}
          <div className="relative sm:hidden">
            <select
              value={activeCategory}
              onChange={e => setActiveCategory(e.target.value as Category)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-espresso/20 bg-cream text-espresso text-sm font-medium focus:outline-none focus:ring-2 focus:ring-vintage-red/40"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c} ({counts[c]})</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-brown pointer-events-none" />
          </div>

          {/* Pill tabs — desktop */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            {categories.map(c => {
              const Icon = CATEGORY_ICONS[c];
              return (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === c
                      ? 'bg-vintage-red text-cream shadow-sm'
                      : 'bg-paper-primary text-warm-brown hover:text-espresso hover:bg-paper-secondary'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {c}
                  <span className={`text-xs ml-0.5 ${activeCategory === c ? 'text-cream/70' : 'text-warm-brown/60'}`}>
                    ({counts[c]})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Provider grid */}
        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <div key={i} className="provider-card paper-card rounded-xl p-4 flex flex-col gap-2.5">
              {/* Name + category + accepting badge */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-espresso text-sm leading-snug">{p.name}</h3>
                <span className={`flex-shrink-0 text-xs font-mono px-2 py-0.5 rounded-full ${CATEGORY_COLORS[p.category]}`}>
                  {p.category}
                </span>
              </div>

              <p className="text-xs text-warm-brown/80 italic">{p.specialty}</p>

              {/* Accepting new patients */}
              <div className={`flex items-center gap-1.5 text-xs font-medium ${p.acceptingNew ? 'text-emerald-700' : 'text-warm-brown/60'}`}>
                <CheckCircle className={`w-3.5 h-3.5 ${p.acceptingNew ? 'text-emerald-600' : 'text-warm-brown/40'}`} />
                {p.acceptingNew ? 'Accepting new patients' : 'Not accepting new patients'}
              </div>

              {/* Hours */}
              {p.hours && (
                <div className="flex items-center gap-1.5 text-xs text-warm-brown">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  {p.hours}
                </div>
              )}

              {/* Address */}
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(p.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-1.5 text-xs text-warm-brown hover:text-vintage-red transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                {p.address}
              </a>

              {/* Phone */}
              <a
                href={`tel:${p.phone.replace(/\D/g, '')}`}
                className="flex items-center gap-1.5 text-xs text-warm-brown hover:text-vintage-red transition-colors"
              >
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                {p.phone}
              </a>

              {/* Notes */}
              {p.notes && (
                <p className="text-xs text-warm-brown/70 italic border-t border-espresso/10 pt-2 mt-0.5">
                  {p.notes}
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-warm-brown/40 mt-6">
          Call ahead to verify current hours, insurance, and availability. To add or update a listing, contact the newsletter team.
        </p>
        </div>{/* /pt-8 */}
        </div>{/* /collapsible body */}
      </div>
    </section>
  );
}
