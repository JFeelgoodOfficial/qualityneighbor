import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Star, ArrowRight, Quote } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SpotlightPerson {
  name: string;
  title: string;
  imgAlt: string;
  qa: { question: string; answer: string }[];
}

// Apr=0 through Dec=8
const MONTHLY_SPOTLIGHTS: SpotlightPerson[] = [
  {
    name: 'Darnell & Rosa T.',
    title: 'Block captains, Bluebonnet Lane',
    imgAlt: 'Darnell and Rosa T.',
    qa: [
      { question: 'What\'s your favorite neighborhood tradition?', answer: '"The annual yard sale trail. It\'s amazing how one person\'s \'junk\' becomes another\'s treasure. Plus, we all get to catch up while browsing."' },
      { question: 'One tip for new neighbors?', answer: '"Introduce yourself with a small treat—it opens every door. We moved in with a plate of cookies and now know everyone on the block."' },
    ],
  },
  {
    name: 'Priya & Anand S.',
    title: 'Community garden founders, Mesquite Drive',
    imgAlt: 'Priya and Anand S.',
    qa: [
      { question: 'What inspired you to start the community garden?', answer: '"We wanted fresh vegetables and friends at the same time. Two years later, we have both."' },
      { question: 'Best thing about Hartland Ranch?', answer: '"People actually wave back. It sounds small but it means everything when you\'re new somewhere."' },
    ],
  },
  {
    name: 'Coach Marcus W.',
    title: 'Little League organizer & 12-year resident',
    imgAlt: 'Marcus W.',
    qa: [
      { question: 'What keeps you involved in the neighborhood?', answer: '"The kids. Seeing them grow up on these streets reminds you why community matters."' },
      { question: 'What would you change about Hartland Ranch?', answer: '"More shaded benches along the walking trail. But I\'m working on it—stay tuned."' },
    ],
  },
  {
    name: 'Linda & Frank O.',
    title: 'Longest-tenured residents, Oak Creek Ct.',
    imgAlt: 'Linda and Frank O.',
    qa: [
      { question: 'How has the neighborhood changed over 20 years?', answer: '"More families, more energy. We love watching the street fill up with kids again like it did when ours were little."' },
      { question: 'One piece of advice for the neighborhood?', answer: '"Show up to the HOA meetings. Your voice matters more than you think."' },
    ],
  },
  {
    name: 'Tamika R.',
    title: 'Registered nurse & block watch captain',
    imgAlt: 'Tamika R.',
    qa: [
      { question: 'How do you balance a demanding career with community involvement?', answer: '"I keep it simple—I just show up when I can. Consistency beats intensity."' },
      { question: 'What\'s one health tip for neighbors this summer?', answer: '"Hydrate before you feel thirsty, especially over 90°F. Most summer ER visits are preventable."' },
    ],
  },
  {
    name: 'Jorge & Elena M.',
    title: 'Small business owners, Hartland since 2018',
    imgAlt: 'Jorge and Elena M.',
    qa: [
      { question: 'What\'s the best part of running a business in a small town?', answer: '"Your customers are your neighbors. That accountability pushes you to do better work every day."' },
      { question: 'What fall tradition are you most excited about?', answer: '"The Caldwell County Fair. We shut the shop and go as a family every single year."' },
    ],
  },
  {
    name: 'The Nguyen Family',
    title: 'Halloween hosts of Hartland Ranch',
    imgAlt: 'The Nguyen Family',
    qa: [
      { question: 'How did you become the Halloween house on the street?', answer: '"It started with a fog machine and got out of hand. We now spend more on candy than groceries in October."' },
      { question: 'What makes a great neighborhood Halloween?', answer: '"Leave your porch light on and come outside. The kids remember the neighbors who actually engage."' },
    ],
  },
  {
    name: 'Pastor David & Clara H.',
    title: 'Food pantry coordinators',
    imgAlt: 'Pastor David and Clara H.',
    qa: [
      { question: 'What does community mean to you during the holidays?', answer: '"Nobody should sit at an empty table in November. We try to make sure that doesn\'t happen here."' },
      { question: 'How can neighbors help the food pantry?', answer: '"Canned goods are great, but we really need volunteers on distribution Saturdays."' },
    ],
  },
  {
    name: 'Sophie & Ben A.',
    title: 'New neighbors, moved in August 2026',
    imgAlt: 'Sophie and Ben A.',
    qa: [
      { question: 'What surprised you most about Hartland Ranch?', answer: '"How fast everyone knew our names. By the second week, three neighbors had brought food to our door."' },
      { question: 'What made you choose this neighborhood?', answer: '"The newsletter, honestly. It told us more about the character of this place than any listing ever could."' },
    ],
  },
];

const _spotlightIndex = Math.min(Math.max(new Date().getMonth() - 3, 0), 8);
const currentSpotlight = MONTHLY_SPOTLIGHTS[_spotlightIndex];

export function SpotlightSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Card animation
      gsap.fromTo(
        cardRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
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

      // Portrait animation
      const portrait = cardRef.current?.querySelector('.portrait');
      if (portrait) {
        gsap.fromTo(
          portrait,
          { scale: 0.96, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Q&A lines stagger
      const qaLines = cardRef.current?.querySelectorAll('.qa-line');
      if (qaLines) {
        gsap.fromTo(
          qaLines,
          { x: 18, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top 65%',
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
      id="spotlight"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-primary))' }}
    >
      <div
        ref={cardRef}
        className="max-w-4xl mx-auto paper-card rounded-2xl overflow-hidden"
      >
        <div className="grid md:grid-cols-5 gap-0">
          {/* Portrait */}
          <div className="md:col-span-2 relative h-72 md:h-auto">
            <img
              src="/images/spotlight-portrait.jpg"
              alt={currentSpotlight.imgAlt}
              loading="lazy"
              className="portrait w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/50 via-transparent to-transparent md:bg-gradient-to-r" />

            {/* Label overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-cream fill-cream" />
                <span className="font-mono text-xs uppercase tracking-wider text-cream/90">
                  Neighbor Spotlight
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3 p-6 sm:p-8">
            {/* Red accent line */}
            <div className="w-12 h-1 bg-vintage-red mb-4" />

            <h3 className="font-display text-2xl sm:text-3xl font-semibold text-espresso mb-1">
              {currentSpotlight.name}
            </h3>
            <p className="text-warm-brown mb-6">
              {currentSpotlight.title}
            </p>

            {/* Q&A */}
            <div className="space-y-5">
              {currentSpotlight.qa.map((item, i) => (
                <div key={i} className="qa-line">
                  <div className="flex items-start gap-3">
                    <Quote className="w-5 h-5 text-vintage-red flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-espresso mb-1">{item.question}</p>
                      <p className="text-sm text-warm-brown leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-6 pt-6 border-t border-espresso/10">
              <button className="flex items-center gap-2 text-vintage-red font-medium hover:gap-3 transition-all">
                Nominate a neighbor
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
