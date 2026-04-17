import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Check, BarChart3 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface PollOption {
  id: string;
  label: string;
  votes: number;
}

interface MonthlyPoll {
  question: string;
  options: PollOption[];
}

// Apr=0 through Dec=8
const MONTHLY_POLLS: MonthlyPoll[] = [
  {
    question: 'What spring event would you most like to see this year?',
    options: [
      { id: '1', label: 'Neighborhood yard sale trail', votes: 34 },
      { id: '2', label: 'Block party cookout', votes: 28 },
      { id: '3', label: 'Community garden workday', votes: 19 },
      { id: '4', label: 'Kids\' outdoor movie night', votes: 22 },
    ],
  },
  {
    question: 'How do you prefer to get neighborhood updates?',
    options: [
      { id: '1', label: 'This newsletter', votes: 47 },
      { id: '2', label: 'Facebook / Nextdoor', votes: 31 },
      { id: '3', label: 'Text message alerts', votes: 18 },
      { id: '4', label: 'Posted flyers', votes: 9 },
    ],
  },
  {
    question: 'What\'s your biggest summer priority at home?',
    options: [
      { id: '1', label: 'Keeping the lawn alive', votes: 29 },
      { id: '2', label: 'Conserving water', votes: 24 },
      { id: '3', label: 'Pool & outdoor fun', votes: 38 },
      { id: '4', label: 'Staying cool indoors', votes: 16 },
    ],
  },
  {
    question: 'Best time for a neighborhood meetup?',
    options: [
      { id: '1', label: 'Saturday morning', votes: 24 },
      { id: '2', label: 'Saturday evening', votes: 18 },
      { id: '3', label: 'Sunday afternoon', votes: 31 },
      { id: '4', label: 'Weeknight (6–8pm)', votes: 12 },
    ],
  },
  {
    question: 'What would most improve our neighborhood?',
    options: [
      { id: '1', label: 'More sidewalks / walking paths', votes: 41 },
      { id: '2', label: 'Better street lighting', votes: 27 },
      { id: '3', label: 'Community park improvements', votes: 33 },
      { id: '4', label: 'Speed limit enforcement', votes: 22 },
    ],
  },
  {
    question: 'What fall activity are you most excited about?',
    options: [
      { id: '1', label: 'Neighborhood Halloween walk', votes: 38 },
      { id: '2', label: 'Fall yard sales', votes: 22 },
      { id: '3', label: 'Back-to-school block party', votes: 17 },
      { id: '4', label: 'Outdoor movie night', votes: 29 },
    ],
  },
  {
    question: 'How do you celebrate Halloween in Hartland Ranch?',
    options: [
      { id: '1', label: 'Full trick-or-treat setup', votes: 44 },
      { id: '2', label: 'Porch light off, quiet night', votes: 11 },
      { id: '3', label: 'Neighborhood party instead', votes: 19 },
      { id: '4', label: 'Take kids elsewhere', votes: 14 },
    ],
  },
  {
    question: 'Where do you shop for Thanksgiving groceries?',
    options: [
      { id: '1', label: 'H-E-B in Lockhart', votes: 52 },
      { id: '2', label: 'Farmers market first, then H-E-B', votes: 18 },
      { id: '3', label: 'Drive to Austin or San Marcos', votes: 12 },
      { id: '4', label: 'Mix of online + local', votes: 9 },
    ],
  },
  {
    question: 'What holiday tradition matters most to you?',
    options: [
      { id: '1', label: 'Neighborhood holiday lights', votes: 39 },
      { id: '2', label: 'Cookie/food exchange', votes: 26 },
      { id: '3', label: 'Community donation drive', votes: 31 },
      { id: '4', label: 'New Year\'s gathering', votes: 14 },
    ],
  },
];

const _now = new Date();
const _pollMonthKey = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}`;
const _pollIndex = Math.min(Math.max(_now.getMonth() - 3, 0), 8);
const { question: pollQuestion, options: pollOptions } = MONTHLY_POLLS[_pollIndex];

export function PollSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasVoted, setHasVoted] = useLocalStorage<boolean>(`poll-voted-${_pollMonthKey}`, false);
  const [selectedOption, setSelectedOption] = useLocalStorage<string | null>(`poll-selection-${_pollMonthKey}`, null);
  const [showResults, setShowResults] = useState(hasVoted);

  const prefersReducedMotion = useReducedMotion();
  const totalVotes = pollOptions.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVote = () => {
    if (selectedOption) {
      setHasVoted(true);
      setShowResults(true);
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { y: 50, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Options stagger
      const options = cardRef.current?.querySelectorAll('.poll-option');
      if (options) {
        gsap.fromTo(
          options,
          { x: -20, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.06,
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

  useEffect(() => {
    if (showResults && !prefersReducedMotion) {
      const bars = cardRef.current?.querySelectorAll('.result-bar');
      if (bars) {
        gsap.fromTo(
          bars,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
        );
      }
    }
  }, [showResults, prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="poll"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-primary))' }}
    >
      <div
        ref={cardRef}
        className="max-w-2xl mx-auto paper-card rounded-2xl overflow-hidden"
      >
        {/* Red top border */}
        <div className="h-1 bg-vintage-red" />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-vintage-red" />
            <span className="font-mono text-xs uppercase tracking-wider text-warm-brown">
              This month's poll
            </span>
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-semibold text-espresso mb-6">
            {pollQuestion}
          </h3>

          {!showResults ? (
            /* Voting Options */
            <div className="space-y-3">
              {pollOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`poll-option w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    selectedOption === option.id
                      ? 'border-vintage-red bg-vintage-red/5'
                      : 'border-paper-secondary hover:border-warm-brown/30'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedOption === option.id
                        ? 'border-vintage-red bg-vintage-red'
                        : 'border-warm-brown/30'
                    }`}
                  >
                    {selectedOption === option.id && (
                      <Check className="w-3 h-3 text-cream" />
                    )}
                  </div>
                  <span className="font-medium text-espresso">{option.label}</span>
                </button>
              ))}

              <button
                onClick={handleVote}
                disabled={!selectedOption}
                className="w-full vintage-red-btn mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                Vote
              </button>

              <button
                onClick={() => setShowResults(true)}
                className="w-full text-center text-sm text-warm-brown hover:text-espresso transition-colors mt-2"
              >
                See results without voting
              </button>
            </div>
          ) : (
            /* Results */
            <div className="space-y-4">
              {pollOptions.map((option) => {
                const percentage = Math.round((option.votes / totalVotes) * 100);
                const isSelected = selectedOption === option.id;

                return (
                  <div key={option.id} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${isSelected ? 'text-vintage-red' : 'text-espresso'}`}>
                        {option.label}
                        {isSelected && <span className="ml-2 text-xs">(Your vote)</span>}
                      </span>
                      <span className="font-mono text-sm text-warm-brown">
                        {percentage}% ({option.votes} votes)
                      </span>
                    </div>
                    <div className="h-3 bg-paper-secondary rounded-full overflow-hidden">
                      <div
                        className="result-bar h-full bg-vintage-red rounded-full origin-left"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-4 border-t border-espresso/10 text-center">
                <p className="text-sm text-warm-brown">
                  Total votes: <span className="font-mono font-bold">{totalVotes}</span>
                </p>
                {!hasVoted && (
                  <button
                    onClick={() => setShowResults(false)}
                    className="text-sm text-vintage-red hover:underline mt-2"
                  >
                    Back to voting
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
