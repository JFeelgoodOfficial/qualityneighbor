import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  FileText,
  Trash2,
  PenTool,
  ExternalLink,
  Zap,
  Flame,
  Wifi,
  ChevronDown,
  Recycle,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Reference Wednesday: April 29, 2026 = trash only. Alternates every week.
function getNextWednesday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilWed = (3 - today.getDay() + 7) % 7;
  const wed = new Date(today);
  wed.setDate(today.getDate() + daysUntilWed);
  return wed;
}

function getTrashStatus() {
  const refWed = new Date('2026-04-29T00:00:00'); // trash only
  const nextWed = getNextWednesday();
  const weeksDiff = Math.round((nextWed.getTime() - refWed.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const isRecycling = ((weeksDiff % 2) + 2) % 2 !== 0;
  const dayLabel = nextWed.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return { isRecycling, dayLabel };
}

function TrashRecyclingLink() {
  const [open, setOpen] = useState(false);
  const { isRecycling, dayLabel } = getTrashStatus();

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-paper-secondary/50 transition-colors group text-left"
        aria-expanded={open}
      >
        <div className="w-10 h-10 rounded-lg bg-paper-secondary flex items-center justify-center group-hover:bg-vintage-red group-hover:text-cream transition-colors flex-shrink-0">
          <Trash2 className="w-5 h-5" />
        </div>
        <span className="font-medium text-espresso group-hover:text-vintage-red transition-colors flex-1">
          Trash & Recycling Schedule
        </span>
        <ChevronDown className={`w-4 h-4 text-warm-brown/40 group-hover:text-vintage-red transition-all duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mx-3 mb-2 px-4 py-3 rounded-xl bg-paper-secondary/60 border border-espresso/8">
          <p className="font-mono text-xs uppercase tracking-wide text-warm-brown/60 mb-1">
            This Wednesday · {dayLabel}
          </p>
          <div className="flex items-center gap-2">
            {isRecycling ? (
              <Recycle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <Trash2 className="w-4 h-4 text-warm-brown flex-shrink-0" />
            )}
            <p className={`font-semibold text-sm ${isRecycling ? 'text-emerald-700' : 'text-espresso'}`}>
              {isRecycling ? 'Trash & Recycling' : 'Trash only'}
            </p>
          </div>
          <p className="text-xs text-warm-brown/60 mt-1.5">Pickups alternate every Wednesday.</p>
        </div>
      )}
    </div>
  );
}

const faqItems = [
  {
    question: 'How do I claim a free ad?',
    answer: 'Local business ads are free for Hartland Ranch residents. Click the "Claim a free ad" button in the Local Business Ads section and submit your business details.',
  },
  {
    question: 'Can I remain anonymous?',
    answer: 'Yes! When posting a shoutout, you can choose to display your first name only, a nickname, or post anonymously.',
  },
  {
    question: 'How do I subscribe to the newsletter?',
    answer: 'Enter your email in the subscription form at the bottom of the page. You will receive the monthly newsletter delivered to your inbox.',
  },
];

const linkClass = 'flex items-center gap-3 p-3 rounded-xl hover:bg-paper-secondary/50 transition-colors group';
const iconBoxClass = 'w-10 h-10 rounded-lg bg-paper-secondary flex items-center justify-center group-hover:bg-vintage-red group-hover:text-cream transition-colors flex-shrink-0';
const labelClass = 'font-medium text-espresso group-hover:text-vintage-red transition-colors flex-1';
const extIconClass = 'w-4 h-4 text-warm-brown/40 group-hover:text-vintage-red transition-colors flex-shrink-0';

export function ResourcesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        leftRef.current,
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

      gsap.fromTo(
        rightRef.current,
        { x: '6vw', opacity: 0 },
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

      const accordionItems = rightRef.current?.querySelectorAll('[data-accordion-item]');
      if (accordionItems) {
        gsap.fromTo(
          accordionItems,
          { y: 12, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.06,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: rightRef.current,
              start: 'top 70%',
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
      id="resources"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-primary))' }}
    >
      {/* Section Header */}
      <div className="section-header mb-10">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-espresso pb-4">
          Resources & FAQ
        </h2>
        <div className="w-44 h-0.5 bg-espresso/20" />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Quick Links */}
        <div ref={leftRef}>
          <h3 className="font-display text-xl font-semibold text-espresso mb-6">
            Quick Links
          </h3>
          <nav className="space-y-2">

            {/* HOA */}
            <a href="https://www.aquitymanagementgroup.com/" target="_blank" rel="noopener noreferrer" className={linkClass}>
              <div className={iconBoxClass}><FileText className="w-5 h-5" /></div>
              <span className={labelClass}>HOA Contact & Documents</span>
              <ExternalLink className={extIconClass} />
            </a>

            {/* Trash & Recycling — expandable dropdown */}
            <TrashRecyclingLink />

            {/* Utilities header */}
            <div className="pt-2 pb-1 px-1">
              <p className="font-mono text-xs uppercase tracking-widest text-warm-brown/50">Utilities</p>
            </div>

            {/* Bluebonnet Electric */}
            <a href="https://bluebonnet.coop" target="_blank" rel="noopener noreferrer" className={linkClass}>
              <div className={iconBoxClass}><Zap className="w-5 h-5" /></div>
              <span className={labelClass}>Bluebonnet Electric Co.</span>
              <ExternalLink className={extIconClass} />
            </a>

            {/* UNIGAS */}
            <a href="https://unigas-tx.com" target="_blank" rel="noopener noreferrer" className={linkClass}>
              <div className={iconBoxClass}><Flame className="w-5 h-5" /></div>
              <span className={labelClass}>UNIGAS</span>
              <ExternalLink className={extIconClass} />
            </a>

            {/* Centric Fiber */}
            <a href="tel:8773427270" className={linkClass}>
              <div className={iconBoxClass}><Wifi className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <span className={labelClass}>Centric Fiber Internet Services</span>
                <p className="text-xs text-warm-brown/60 mt-0.5 font-mono">877.342.7270</p>
              </div>
            </a>

            {/* Submit a Story */}
            <a href="#" className={linkClass}>
              <div className={iconBoxClass}><PenTool className="w-5 h-5" /></div>
              <span className={labelClass}>Submit a Story</span>
              <ExternalLink className={extIconClass} />
            </a>

          </nav>
        </div>

        {/* FAQ Accordion */}
        <div ref={rightRef}>
          <h3 className="font-display text-xl font-semibold text-espresso mb-6">
            Frequently Asked Questions
          </h3>
          <Accordion type="single" collapsible className="space-y-2">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                data-accordion-item
                className="paper-card rounded-xl border-none px-4"
              >
                <AccordionTrigger className="text-left font-medium text-espresso hover:text-vintage-red hover:no-underline py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-warm-brown pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
