import { lazy, Suspense, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from '@/components/Navigation';
import { QuickActionButton } from '@/components/QuickActionButton';
import { HeroSection } from '@/sections/HeroSection';
import { AtAGlanceSection } from '@/sections/AtAGlanceSection';
import './App.css';

// Lazy-load below-fold sections to reduce initial bundle size
const NeedsSection = lazy(() => import('@/sections/NeedsSection').then(m => ({ default: m.NeedsSection })));
const EventsSection = lazy(() => import('@/sections/EventsSection').then(m => ({ default: m.EventsSection })));
const PollSection = lazy(() => import('@/sections/PollSection').then(m => ({ default: m.PollSection })));
const StorySection = lazy(() => import('@/sections/StorySection').then(m => ({ default: m.StorySection })));
const GardenTipSection = lazy(() => import('@/sections/GardenTipSection').then(m => ({ default: m.GardenTipSection })));
const BusinessAdsSection = lazy(() => import('@/sections/BusinessAdsSection').then(m => ({ default: m.BusinessAdsSection })));
const SpotlightSection = lazy(() => import('@/sections/SpotlightSection').then(m => ({ default: m.SpotlightSection })));
const ShoutoutsSection = lazy(() => import('@/sections/ShoutoutsSection').then(m => ({ default: m.ShoutoutsSection })));
const ResourcesSection = lazy(() => import('@/sections/ResourcesSection').then(m => ({ default: m.ResourcesSection })));
const ContactSection = lazy(() => import('@/sections/ContactSection').then(m => ({ default: m.ContactSection })));

gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {
    // Wait for all ScrollTriggers to be created
    const timeout = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      
      if (!maxScroll || pinned.length === 0) return;

      // Build ranges and snap targets from pinned sections
      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      // Create global snap
      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            // Check if within any pinned range (with small buffer)
            const inPinned = pinnedRanges.some(
              r => value >= r.start - 0.02 && value <= r.end + 0.02
            );
            
            if (!inPinned) return value; // Flowing section: free scroll

            // Find nearest pinned center
            const target = pinnedRanges.reduce((closest, r) =>
              Math.abs(r.center - value) < Math.abs(closest - value) ? r.center : closest,
              pinnedRanges[0]?.center ?? 0
            );
            
            return target;
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
        <AtAGlanceSection />
        <Suspense fallback={null}>
          <NeedsSection />
          <EventsSection />
          <PollSection />
          <StorySection />
          <GardenTipSection />
          <BusinessAdsSection />
          <SpotlightSection />
          <ShoutoutsSection />
          <ResourcesSection />
          <ContactSection />
        </Suspense>
      </main>

      <QuickActionButton />
    </div>
  );
}

export default App;
