import { useRef, useState, useEffect } from 'react';
import { Gamepad2, ChevronDown, ExternalLink } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  description: string;
  url: string;
  height?: number;
}

const GAMES: Game[] = [
  {
    id: 'bunny-warren',
    title: 'Bunny Warren',
    description: 'A game by your neighbor — click to play, no download needed.',
    url: 'https://playcentralgames.com/game.html',
    height: 640,
  },
  {
    id: 'slingshot-carnival',
    title: 'Slingshot Carnival',
    description: 'Step right up! A carnival slingshot game — click to play, no download needed.',
    url: 'https://playcentralgames.vercel.app/slingshot-carnival.html',
    height: 600,
  },
];

function GameItem({ game }: { game: Game }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [srcLoaded, setSrcLoaded] = useState(false);

  useEffect(() => {
    if (isExpanded && !srcLoaded) setSrcLoaded(true);
  }, [isExpanded, srcLoaded]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = isExpanded ? el.scrollHeight + 'px' : '0px';
  }, [isExpanded]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el && isExpanded) el.style.height = el.scrollHeight + 'px';
  }, [srcLoaded, isExpanded]);

  return (
    <div className="border-b border-paper-secondary last:border-b-0">
      <button
        onClick={() => setIsExpanded(p => !p)}
        className="w-full text-left group py-5"
        aria-expanded={isExpanded}
        aria-controls={`${game.id}-body`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-espresso group-hover:text-vintage-red transition-colors">
              {game.title}
            </h3>
            <p className="text-warm-brown mt-1 text-sm">
              {isExpanded ? 'Click to collapse the game.' : game.description}
            </p>
          </div>
          <div className={`flex-shrink-0 mt-1 w-9 h-9 rounded-full bg-paper-secondary flex items-center justify-center text-warm-brown group-hover:text-vintage-red transition-all duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </button>

      <div
        id={`${game.id}-body`}
        ref={bodyRef}
        className="overflow-hidden transition-[height] duration-500 ease-in-out"
        style={{ height: 0 }}
        aria-hidden={!isExpanded}
      >
        <div className="pb-6 flex flex-col items-center gap-3">
          <div className="w-full flex justify-center">
            <iframe
              src={srcLoaded ? game.url : undefined}
              width="100%"
              height={game.height ?? 600}
              frameBorder="0"
              allow="autoplay"
              title={`${game.title} game`}
              style={{ borderRadius: '12px', maxWidth: '860px' }}
            />
          </div>
          <a
            href={game.url}
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
  );
}

export function BunnyWarrenSection() {
  return (
    <section
      id="bunny-warren"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-primary))' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="section-header pb-6 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 className="w-4 h-4 text-vintage-red" />
            <span className="font-mono text-xs uppercase tracking-wider text-warm-brown">
              Play a Game
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-espresso">
            Neighborhood Arcade
          </h2>
          <p className="text-warm-brown mt-1 max-w-xl">
            Games made for and by the community — no download needed.
          </p>
        </div>

        <div>
          {GAMES.map(game => (
            <GameItem key={game.id} game={game} />
          ))}
        </div>
      </div>
    </section>
  );
}
