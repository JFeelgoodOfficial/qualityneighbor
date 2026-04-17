import { useRef, useState, useEffect } from 'react';
import { Gamepad2, ChevronDown, ExternalLink } from 'lucide-react';

const GAME_URL = 'https://playcentralgames.com/game.html';

export function BunnyWarrenSection() {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [srcLoaded, setSrcLoaded] = useState(false);

  // Only inject the src on first open — game assets never load unless user clicks
  useEffect(() => {
    if (isExpanded && !srcLoaded) setSrcLoaded(true);
  }, [isExpanded, srcLoaded]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = isExpanded ? el.scrollHeight + 'px' : '0px';
  }, [isExpanded]);

  // After src loads, the iframe height is fixed so we need to reset container height
  useEffect(() => {
    const el = bodyRef.current;
    if (el && isExpanded) el.style.height = el.scrollHeight + 'px';
  }, [srcLoaded, isExpanded]);

  return (
    <section
      id="bunny-warren"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-primary))' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header — toggle */}
        <button
          onClick={() => setIsExpanded(p => !p)}
          className="w-full text-left group"
          aria-expanded={isExpanded}
          aria-controls="bunny-warren-body"
        >
          <div className="section-header pb-6 mb-0 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Gamepad2 className="w-4 h-4 text-vintage-red" />
                <span className="font-mono text-xs uppercase tracking-wider text-warm-brown">
                  Play a Game
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-espresso group-hover:text-vintage-red transition-colors">
                Bunny Warren
              </h2>
              <p className="text-warm-brown mt-1 max-w-xl">
                {isExpanded
                  ? 'Click to collapse the game.'
                  : 'A game by your neighbor — click to play, no download needed.'}
              </p>
            </div>
            <div className={`flex-shrink-0 mt-1 w-9 h-9 rounded-full bg-paper-secondary flex items-center justify-center text-warm-brown group-hover:text-vintage-red transition-all duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </button>

        {/* Collapsible body */}
        <div
          id="bunny-warren-body"
          ref={bodyRef}
          className="overflow-hidden transition-[height] duration-500 ease-in-out"
          style={{ height: 0 }}
          aria-hidden={!isExpanded}
        >
          <div className="pt-6 flex flex-col items-center gap-3">
            <div className="w-full flex justify-center">
              <iframe
                src={srcLoaded ? GAME_URL : undefined}
                width="100%"
                height="640"
                frameBorder="0"
                allow="autoplay"
                title="Bunny Warren game"
                style={{ borderRadius: '16px', maxWidth: '860px' }}
              />
            </div>
            <a
              href={GAME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-warm-brown hover:text-vintage-red transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in full screen
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
