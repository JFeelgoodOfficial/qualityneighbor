import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from '@/components/Navigation';
import { QuickActionButton } from '@/components/QuickActionButton';
import { HeroSection } from '@/sections/HeroSection';
import { AtAGlanceSection } from '@/sections/AtAGlanceSection';
import { NeedsSection } from '@/sections/NeedsSection';
import { EventsSection } from '@/sections/EventsSection';
import { PollSection } from '@/sections/PollSection';
import { StorySection } from '@/sections/StorySection';
import { GardenTipSection } from '@/sections/GardenTipSection';
import { BusinessAdsSection } from '@/sections/BusinessAdsSection';
import { SpotlightSection } from '@/sections/SpotlightSection';
import { ShoutoutsSection } from '@/sections/ShoutoutsSection';
import { ResourcesSection } from '@/sections/ResourcesSection';
import { ContactSection } from '@/sections/ContactSection';
import './App.css';

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
      </main>

      <QuickActionButton />
    </div>
  );
}

export default App;
