import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Stethoscope, Eye, Search, MapPin, Phone, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type Category = 'All' | 'Medical' | 'Dental' | 'Vision';

interface Provider {
  npi: string;
  name: string;
  specialty: string;
  category: Exclude<Category, 'All'>;
  address: string;
  phone: string;
}

interface NpiAddress {
  address_1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  telephone_number?: string;
  address_purpose?: string;
}

interface NpiTaxonomy {
  desc?: string;
  primary?: boolean;
  code?: string;
}

interface NpiResult {
  number?: string;
  basic?: {
    first_name?: string;
    last_name?: string;
    organization_name?: string;
    credential?: string;
  };
  addresses?: NpiAddress[];
  taxonomies?: NpiTaxonomy[];
}

const CATEGORY_KEYWORDS: Record<Exclude<Category, 'All'>, string[]> = {
  Medical: [
    'family', 'internal', 'general practice', 'physician', 'pediatric',
    'obstetric', 'gynecol', 'urgent care', 'primary care', 'nurse practitioner',
    'physician assistant', 'psychiatr', 'psycholog', 'cardiol', 'dermatol',
    'neurolog', 'orthoped', 'surgery', 'radiol', 'patholog', 'emergency',
  ],
  Dental: ['dent', 'endodont', 'periodont', 'prosthodont', 'orthodont', 'oral'],
  Vision: ['optom', 'ophthalmol', 'vision', 'ocular', 'eye'],
};

function classifyProvider(taxonomies: NpiTaxonomy[]): Exclude<Category, 'All'> | null {
  const desc = taxonomies
    .map(t => (t.desc ?? '').toLowerCase())
    .join(' ');

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Exclude<Category, 'All'>, string[]][]) {
    if (keywords.some(kw => desc.includes(kw))) return cat;
  }
  return null;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits[0] === '1') return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return raw;
}

function parseProviders(results: NpiResult[]): Provider[] {
  const providers: Provider[] = [];

  for (const r of results) {
    const taxonomies = r.taxonomies ?? [];
    const category = classifyProvider(taxonomies);
    if (!category) continue;

    const primaryTaxonomy = taxonomies.find(t => t.primary) ?? taxonomies[0];
    const specialty = primaryTaxonomy?.desc ?? 'General Practice';

    const practiceAddr = (r.addresses ?? []).find(a => a.address_purpose === 'LOCATION')
      ?? (r.addresses ?? [])[0];

    const address = practiceAddr
      ? [practiceAddr.address_1, practiceAddr.city, practiceAddr.state]
          .filter(Boolean).join(', ')
      : 'Lockhart, TX';

    const phone = practiceAddr?.telephone_number
      ? formatPhone(practiceAddr.telephone_number)
      : '';

    const name = r.basic?.organization_name
      ? r.basic.organization_name
      : [r.basic?.first_name, r.basic?.last_name, r.basic?.credential]
          .filter(Boolean).join(' ');

    providers.push({
      npi: r.number ?? '',
      name,
      specialty,
      category,
      address,
      phone,
    });
  }

  return providers.sort((a, b) => a.name.localeCompare(b.name));
}

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  All: Stethoscope,
  Medical: Stethoscope,
  Dental: Search,
  Vision: Eye,
};

const CATEGORY_COLORS: Record<Exclude<Category, 'All'>, string> = {
  Medical: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  Dental: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  Vision: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
};

export function HealthDirectorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = 'https://npiregistry.cms.hhs.gov/api/?version=2.1&city=Lockhart&state=TX&limit=200';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`NPI API ${res.status}`);
      const data = await res.json();
      const parsed = parseProviders(data.results ?? []);
      setProviders(parsed);
    } catch {
      setError('Unable to load provider directory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion || loading) return;

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
  }, [prefersReducedMotion, loading, activeCategory]);

  const filtered = activeCategory === 'All'
    ? providers
    : providers.filter(p => p.category === activeCategory);

  const counts: Record<Category, number> = {
    All: providers.length,
    Medical: providers.filter(p => p.category === 'Medical').length,
    Dental: providers.filter(p => p.category === 'Dental').length,
    Vision: providers.filter(p => p.category === 'Vision').length,
  };

  const categories: Category[] = ['All', 'Medical', 'Dental', 'Vision'];

  return (
    <section
      ref={sectionRef}
      id="health-directory"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-secondary))' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="section-header pb-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="w-4 h-4 text-vintage-red" />
            <span className="font-mono text-xs uppercase tracking-wider text-warm-brown">
              Health &amp; Wellness
            </span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-espresso">
                Local Medical Directory
              </h2>
              <p className="text-warm-brown mt-1 max-w-xl">
                Licensed providers in Lockhart, TX — sourced live from the federal NPI Registry.
              </p>
            </div>
            <button
              onClick={fetchProviders}
              aria-label="Refresh directory"
              className={`p-2 rounded-full text-warm-brown hover:text-espresso hover:bg-paper-primary transition-colors flex-shrink-0 ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category filter dropdown + pill tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {/* Dropdown — mobile-friendly */}
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

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-vintage-red/10 border border-vintage-red/20 text-vintage-red mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="paper-card rounded-xl p-4 h-28 animate-pulse bg-paper-primary/60" />
            ))}
          </div>
        )}

        {/* Provider grid */}
        {!loading && filtered.length > 0 && (
          <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <div key={p.npi} className="provider-card paper-card rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-espresso text-sm leading-snug">{p.name}</h3>
                  <span className={`flex-shrink-0 text-xs font-mono px-2 py-0.5 rounded-full ${CATEGORY_COLORS[p.category]}`}>
                    {p.category}
                  </span>
                </div>
                <p className="text-xs text-warm-brown/80 italic">{p.specialty}</p>
                {p.address && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(p.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-1.5 text-xs text-warm-brown hover:text-vintage-red transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    {p.address}
                  </a>
                )}
                {p.phone && (
                  <a
                    href={`tel:${p.phone.replace(/\D/g, '')}`}
                    className="flex items-center gap-1.5 text-xs text-warm-brown hover:text-vintage-red transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    {p.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && !error && (
          <div className="text-center py-12 text-warm-brown">
            <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No providers found in this category.</p>
          </div>
        )}

        <p className="text-xs text-warm-brown/40 mt-6">
          Data sourced from the CMS National Plan &amp; Provider Enumeration System (NPPES). Call ahead to verify hours and insurance.
        </p>
      </div>
    </section>
  );
}
