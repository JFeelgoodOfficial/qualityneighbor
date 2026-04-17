import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Droplets, Sun, Shovel, Scissors, Bookmark, Check, Sprout, Wind, Snowflake, Flower2, Leaf } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Tip { icon: React.ElementType; text: string; }
interface MonthlyTips { headline: string; intro: string; tips: Tip[]; }

// Apr=0 through Dec=8
const MONTHLY_TIPS: MonthlyTips[] = [
  {
    headline: 'Spring planting in Central Texas',
    intro: 'April is prime planting season before the heat arrives. Set your garden up for a strong summer.',
    tips: [
      { icon: Sprout, text: 'Start warm-season vegetables: tomatoes, peppers, squash, and beans are all go.' },
      { icon: Shovel, text: 'Amend beds with compost before planting — Caldwell County soil benefits from organic matter.' },
      { icon: Droplets, text: 'Water new transplants daily for the first two weeks until roots are established.' },
      { icon: Scissors, text: 'Deadhead spring blooms to encourage continued flowering through May.' },
    ],
  },
  {
    headline: 'Beat the May heat before it peaks',
    intro: 'Temperatures are climbing. A few smart moves now will save your garden all summer.',
    tips: [
      { icon: Shovel, text: 'Lay 3–4 inches of mulch around all beds to retain moisture and moderate soil temp.' },
      { icon: Droplets, text: 'Set up soaker hoses or drip irrigation before daily watering becomes critical.' },
      { icon: Scissors, text: 'Pinch basil tops to prevent bolting and extend your harvest.' },
      { icon: Sun, text: 'Plant heat-tolerant marigolds and zinnias now — they thrive in Texas summers.' },
    ],
  },
  {
    headline: 'Keep your garden alive in June heat',
    intro: 'June means triple-digit flirting. Shift focus to survival and drought tolerance.',
    tips: [
      { icon: Droplets, text: 'Water deeply (30 min) 2–3× per week rather than light daily watering — encourages deep roots.' },
      { icon: Sun, text: 'Use shade cloth (30–40%) over tomatoes and peppers during peak afternoon sun.' },
      { icon: Shovel, text: 'Side-dress heavy feeders like tomatoes with slow-release fertilizer.' },
      { icon: Scissors, text: 'Harvest okra, squash, and cucumbers daily — overgrown ones stop production.' },
    ],
  },
  {
    headline: 'Surviving the Texas July',
    intro: 'July is the toughest month. Focus on water management and protecting what you have.',
    tips: [
      { icon: Droplets, text: 'Water early (5–8am) to minimize evaporation — midday watering loses up to 50% to heat.' },
      { icon: Sun, text: 'Don\'t fertilize stressed plants in peak heat — wait until temps drop below 95°F.' },
      { icon: Shovel, text: 'Check mulch depth and top off to 4 inches if it has broken down.' },
      { icon: Sprout, text: 'Start seeds for fall garden indoors: broccoli, cabbage, and kale need 6–8 weeks lead time.' },
    ],
  },
  {
    headline: 'Keep your garden happy in August heat',
    intro: 'Texas summers are relentless. Here are four simple tips to help your plants thrive through the hottest month.',
    tips: [
      { icon: Droplets, text: 'Water early (5–8am) to reduce evaporation and help roots absorb moisture.' },
      { icon: Shovel, text: 'Mulch now to lock in moisture and keep soil temperatures stable.' },
      { icon: Sun, text: 'Shade tender plants during peak sun hours with cloth or shade cloth.' },
      { icon: Scissors, text: 'Harvest herbs before they bolt to enjoy the best flavor.' },
    ],
  },
  {
    headline: 'Fall garden prep starts in September',
    intro: 'Relief is on the way. September is your second spring — plant now for a fall harvest.',
    tips: [
      { icon: Sprout, text: 'Transplant fall vegetable starts: broccoli, cauliflower, spinach, and Swiss chard.' },
      { icon: Shovel, text: 'Refresh tired beds with compost before fall planting — now is the time to rebuild soil.' },
      { icon: Leaf, text: 'Pull out spent summer crops to reduce pest and disease carryover into fall.' },
      { icon: Flower2, text: 'Plant fall-blooming perennials like Mexican sage, lantana, and fall asters.' },
    ],
  },
  {
    headline: 'October: the best gardening month in Texas',
    intro: 'Cool weather returns. October is prime time for planting and outdoor projects.',
    tips: [
      { icon: Flower2, text: 'Plant spring-blooming bulbs now: bluebonnets, alliums, and daffodils for March color.' },
      { icon: Shovel, text: 'This is the ideal time to plant trees and shrubs — roots establish well in cooler soil.' },
      { icon: Scissors, text: 'Cut back ornamental grasses and perennials after first frost to tidy the yard.' },
      { icon: Sprout, text: 'Sow cool-season greens directly: arugula, lettuce, and cilantro germinate fast now.' },
    ],
  },
  {
    headline: 'November: prep for winter and plant garlic',
    intro: 'The growing season winds down but the work isn\'t over. A few tasks now pay off in spring.',
    tips: [
      { icon: Shovel, text: 'Plant garlic cloves 2 inches deep now for a June harvest — it\'s surprisingly easy.' },
      { icon: Leaf, text: 'Compost fallen leaves rather than bagging — free organic matter for spring beds.' },
      { icon: Wind, text: 'Protect citrus and tender perennials with frost cloth when temps drop below 28°F.' },
      { icon: Scissors, text: 'Wait until February to cut back roses — trimming now can stimulate frost-vulnerable growth.' },
    ],
  },
  {
    headline: 'December garden: rest, plan, and protect',
    intro: 'The garden rests but you don\'t have to. December is the best time to plan next year.',
    tips: [
      { icon: Snowflake, text: 'Protect outdoor faucets with foam covers when hard freeze (below 28°F) is forecast.' },
      { icon: Shovel, text: 'Work compost into empty beds now so it integrates before spring planting.' },
      { icon: Sprout, text: 'Order seed catalogs and plan next year\'s layout — varieties sell out by February.' },
      { icon: Wind, text: 'Move cold-sensitive container plants to a sheltered spot or garage on freeze nights.' },
    ],
  },
];

const monthIndex = Math.min(Math.max(new Date().getMonth() - 3, 0), 8);
const { headline, intro, tips } = MONTHLY_TIPS[monthIndex];

export function GardenTipSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useLocalStorage<boolean>('garden-tip-saved', false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Card animation
      gsap.fromTo(
        cardRef.current,
        { y: 45, opacity: 0 },
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

      // Bullets stagger
      const bullets = cardRef.current?.querySelectorAll('.tip-bullet');
      if (bullets) {
        gsap.fromTo(
          bullets,
          { x: -12, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardRef.current,
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
      id="garden-tip"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-primary))' }}
    >
      <div
        ref={cardRef}
        className="max-w-4xl mx-auto paper-card rounded-2xl overflow-hidden"
      >
        <div className="grid md:grid-cols-5 gap-0">
          {/* Image */}
          <div className="md:col-span-2 relative h-64 md:h-auto">
            <img
              src="/images/garden-tip.jpg"
              alt="Watering a tomato plant"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 to-transparent md:bg-gradient-to-r" />
          </div>

          {/* Content */}
          <div className="md:col-span-3 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="category-pill bg-emerald-100 text-emerald-800">
                Garden & Home
              </span>
              <button
                onClick={() => setSaved(!saved)}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  saved ? 'text-vintage-red' : 'text-warm-brown hover:text-espresso'
                }`}
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    Save for later
                  </>
                )}
              </button>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-semibold text-espresso mb-4">
              {headline}
            </h3>

            <p className="text-warm-brown mb-6">
              {intro}
            </p>

            <ul className="space-y-3">
              {tips.map((tip, index) => (
                <li
                  key={index}
                  className="tip-bullet flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-paper-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <tip.icon className="w-4 h-4 text-warm-brown" />
                  </div>
                  <span className="text-sm text-espresso leading-relaxed">{tip.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
