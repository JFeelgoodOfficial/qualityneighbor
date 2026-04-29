interface PremiumAdBannerProps {
  sponsorName: string;
  sponsorUrl: string;
  sponsorDisplay?: string;
  mediaSrc?: string;
  mediaType?: 'image' | 'video';
}

const SEPARATOR = '  ·  ';

export function PremiumAdBanner({
  sponsorName,
  sponsorUrl,
  sponsorDisplay,
  mediaSrc,
  mediaType = 'image',
}: PremiumAdBannerProps) {
  const label = sponsorDisplay ?? sponsorName;
  const segment =
    `QualityNeighbor${SEPARATOR}Brought to you by ${label}${SEPARATOR}` +
    `Your neighborhood newsletter${SEPARATOR}Support local${SEPARATOR}`;
  const tickerContent = segment.repeat(6);

  return (
    <div
      className="w-full overflow-hidden"
      style={{ background: 'hsl(var(--espresso))' }}
    >
      <div className="flex items-stretch" style={{ minHeight: '9rem' }}>

        {/* Media block */}
        <div
          className="w-36 sm:w-52 flex-shrink-0 overflow-hidden border-r"
          style={{ borderColor: 'hsl(var(--paper-primary) / 0.08)' }}
        >
          {mediaSrc && mediaType === 'image' && (
            <img
              src={mediaSrc}
              alt={`${label} advertisement`}
              className="w-full h-full object-cover"
            />
          )}
          {mediaSrc && mediaType === 'video' && (
            <video
              src={mediaSrc}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              aria-label={`${label} advertisement`}
            />
          )}
          {!mediaSrc && (
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-2"
              style={{ background: 'hsl(var(--warm-brown) / 0.25)' }}
            >
              <div
                className="w-20 sm:w-28 h-12 sm:h-16 rounded-lg flex items-center justify-center"
                style={{ background: 'hsl(var(--warm-brown) / 0.25)' }}
              >
                <span
                  className="font-mono text-xs uppercase tracking-widest"
                  style={{ color: 'hsl(var(--paper-primary) / 0.35)' }}
                >
                  logo
                </span>
              </div>
              <span
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: 'hsl(var(--paper-primary) / 0.30)' }}
              >
                Sponsored
              </span>
            </div>
          )}
        </div>

        {/* Right: label + ticker */}
        <div className="flex-1 flex flex-col justify-center overflow-hidden py-5 gap-3">

          {/* Sponsor label row */}
          <div className="px-5 sm:px-8 flex items-center gap-3">
            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: 'hsl(var(--paper-primary) / 0.40)' }}
            >
              Premium Sponsor
            </span>
            <span style={{ color: 'hsl(var(--paper-primary) / 0.20)' }}>·</span>
            <a
              href={sponsorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-semibold underline underline-offset-2 transition-opacity hover:opacity-100"
              style={{ color: 'hsl(var(--vintage-red) / 0.85)' }}
            >
              {label}
            </a>
          </div>

          {/* Scrolling ticker */}
          <div className="overflow-hidden">
            <div className="ticker-track">
              <span
                className="font-display text-xl sm:text-2xl font-semibold whitespace-nowrap pr-16"
                style={{ color: 'hsl(var(--paper-primary) / 0.85)' }}
              >
                {tickerContent}
              </span>
              <span
                className="font-display text-xl sm:text-2xl font-semibold whitespace-nowrap pr-16"
                aria-hidden="true"
                style={{ color: 'hsl(var(--paper-primary) / 0.85)' }}
              >
                {tickerContent}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
