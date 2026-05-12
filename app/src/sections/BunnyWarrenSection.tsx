import { Gamepad2 } from 'lucide-react';

export function BunnyWarrenSection() {
  return (
    <section
      id="bunny-warren"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-secondary))' }}
    >
      <div className="section-header mb-10">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-espresso pb-4">
          Neighborhood Arcade
        </h2>
        <div className="w-44 h-0.5 bg-espresso/20" />
        <p className="mt-3 text-warm-brown">
          Games by and for Hartland Ranch neighbors.
        </p>
      </div>

      <div className="max-w-md mx-auto text-center py-16 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center">
          <Gamepad2 className="w-8 h-8 text-violet-500" />
        </div>
        <h3 className="font-display text-2xl font-semibold text-espresso">Coming Soon</h3>
        <p className="text-warm-brown">
          The arcade is under construction. Check back next month for neighborhood games.
        </p>
      </div>
    </section>
  );
}
