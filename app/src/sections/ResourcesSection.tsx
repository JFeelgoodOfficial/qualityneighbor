import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  FileText,
  Trash2,
  Droplets,
  Shield,
  Search,
  PenTool,
  ExternalLink,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const quickLinks = [
  { label: 'HOA Contact & Documents', icon: FileText, href: '#' },
  { label: 'Trash & Recycling Schedule', icon: Trash2, href: '#' },
  { label: 'City of Lockhart Utilities', icon: Droplets, href: '#' },
  { label: 'Neighborhood Safety Tips', icon: Shield, href: '#' },
  { label: 'Lost & Found Board', icon: Search, href: '#' },
  { label: 'Submit a Story', icon: PenTool, href: '#' },
];

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
      // Left column animation
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

      // Right column animation
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

      // Accordion items stagger
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
            {quickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-paper-secondary/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-paper-secondary flex items-center justify-center group-hover:bg-vintage-red group-hover:text-cream transition-colors">
                  <link.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-espresso group-hover:text-vintage-red transition-colors flex-1">
                  {link.label}
                </span>
                <ExternalLink className="w-4 h-4 text-warm-brown/40 group-hover:text-vintage-red transition-colors" />
              </a>
            ))}
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
