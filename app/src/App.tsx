import { useEffect, lazy, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from '@/components/Navigation';
import { QuickActionButton } from '@/components/QuickActionButton';
import { Toaster } from '@/components/ui/sonner';
import { HeroSection } from '@/sections/HeroSection';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

// Below-fold sections are lazy-loaded to reduce initial JS parse time
const AtAGlanceSection = lazy(() =>
  import('@/sections/AtAGlanceSection').then(m => ({ default: m.AtAGlanceSection }))
);
const EventsSection = lazy(() =>
  import('@/sections/EventsSection').then(m => ({ default: m.EventsSection }))
);
const PollSection = lazy(() =>
  import('@/sections/PollSection').then(m => ({ default: m.PollSection }))
);
const StorySection = lazy(() =>
  import('@/sections/StorySection').then(m => ({ default: m.StorySection }))
);
const GardenTipSection = lazy(() =>
  import('@/sections/GardenTipSection').then(m => ({ default: m.GardenTipSection }))
);
const BusinessAdsSection = lazy(() =>
  import('@/sections/BusinessAdsSection').then(m => ({ default: m.BusinessAdsSection }))
);
const SpotlightSection = lazy(() =>
  import('@/sections/SpotlightSection').then(m => ({ default: m.SpotlightSection }))
);
const ShoutoutsSection = lazy(() =>
  import('@/sections/ShoutoutsSection').then(m => ({ default: m.ShoutoutsSection }))
);
const ResourcesSection = lazy(() =>
  import('@/sections/ResourcesSection').then(m => ({ default: m.ResourcesSection }))
);
const ContactSection = lazy(() =>
  import('@/sections/ContactSection').then(m => ({ default: m.ContactSection }))
);

// Minimal height-preserving fallback to avoid layout shift while chunks load
function SectionFallback() {
  return <div className="min-h-[50vh]" aria-hidden="true" />;
}

function App() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);

      const maxScroll = ScrollTrigger.maxScroll(window);

      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            const inPinned = pinnedRanges.some(
              r => value >= r.start - 0.02 && value <= r.end + 0.02
            );
            if (!inPinned) return value;
            return pinnedRanges.reduce((closest, r) =>
              Math.abs(r.center - value) < Math.abs(closest - value) ? r.center : closest,
              pinnedRanges[0]?.center ?? 0
            );
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out',
        },
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div className="relative min-h-screen paper-grain">
      <Navigation />

      <main className="relative">
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <AtAGlanceSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <EventsSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <PollSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <StorySection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <GardenTipSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <BusinessAdsSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <SpotlightSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <ShoutoutsSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <ResourcesSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <ContactSection />
        </Suspense>
      </main>

      <QuickActionButton />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default App;
