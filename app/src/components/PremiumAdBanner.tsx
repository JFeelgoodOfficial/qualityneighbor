interface PremiumAdBannerProps {
  sponsorName: string;
  sponsorUrl: string;
  sponsorDisplay?: string;
}

export function PremiumAdBanner({ sponsorName, sponsorUrl, sponsorDisplay }: PremiumAdBannerProps) {
  return (
    <div
      className="w-full py-3 px-4 sm:px-6 lg:px-8"
      style={{ background: 'hsl(var(--espresso))' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap">
        <span
          className="font-mono text-xs uppercase tracking-widest opacity-50"
          style={{ color: 'hsl(var(--paper-primary))' }}
        >
          Sponsored
        </span>
        <span
          className="font-display text-sm font-semibold"
          style={{ color: 'hsl(var(--paper-primary))' }}
        >
          QualityNeighbor
        </span>
        <span className="opacity-30" style={{ color: 'hsl(var(--paper-primary))' }}>·</span>
        <span
          className="font-body text-xs opacity-70"
          style={{ color: 'hsl(var(--paper-primary))' }}
        >
          Brought to you by
        </span>
        <a
          href={sponsorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs font-semibold underline underline-offset-2 hover:opacity-100 transition-opacity opacity-80"
          style={{ color: 'hsl(var(--vintage-red) / 0.9)' }}
        >
          {sponsorDisplay ?? sponsorName}
        </a>
      </div>
    </div>
  );
}
