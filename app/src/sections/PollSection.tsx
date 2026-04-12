import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, BarChart3 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

gsap.registerPlugin(ScrollTrigger);

interface PollOption {
  id: string;
  label: string;
  votes: number;
}

const pollData: PollOption[] = [
  { id: '1', label: 'Saturday morning', votes: 24 },
  { id: '2', label: 'Saturday evening', votes: 18 },
  { id: '3', label: 'Sunday afternoon', votes: 31 },
  { id: '4', label: 'Weeknight (6–8pm)', votes: 12 },
];

export function PollSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasVoted, setHasVoted] = useLocalStorage<boolean>('poll-voted', false);
  const [selectedOption, setSelectedOption] = useLocalStorage<string | null>('poll-selection', null);
  const [showResults, setShowResults] = useState(hasVoted);

  const totalVotes = pollData.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVote = () => {
    if (selectedOption) {
      setHasVoted(true);
      setShowResults(true);
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Card animation
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
  }, []);

  // Animate results bars when shown
  useEffect(() => {
    if (showResults) {
      const bars = cardRef.current?.querySelectorAll('.result-bar');
      if (bars) {
        gsap.fromTo(
          bars,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
        );
      }
    }
  }, [showResults]);

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
            What's the best time for a neighborhood meetup?
          </h3>

          {!showResults ? (
            /* Voting Options */
            <div className="space-y-3">
              {pollData.map((option) => (
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
              {pollData.map((option) => {
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
