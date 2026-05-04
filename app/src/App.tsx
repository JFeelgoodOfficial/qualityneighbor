import { lazy, Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { QuickActionButton } from '@/components/QuickActionButton';
import { PremiumAdBanner } from '@/components/PremiumAdBanner';
import { Toaster } from '@/components/ui/sonner';
import { HeroSection } from '@/sections/HeroSection';
import './App.css';


// Below-fold sections are lazy-loaded to reduce initial JS parse time
const EventsSection = lazy(() =>
  import('@/sections/EventsSection').then(m => ({ default: m.EventsSection }))
);
const PollSection = lazy(() => import('@/sections/PollSection'));
const StorySection = lazy(() =>
  import('@/sections/StorySection').then(m => ({ default: m.StorySection }))
);
const GardenTipSection = lazy(() =>
  import('@/sections/GardenTipSection').then(m => ({ default: m.GardenTipSection }))
);
const BusinessAdsSection = lazy(() =>
  import('@/sections/BusinessAdsSection').then(m => ({ default: m.BusinessAdsSection }))
);
const ShoutoutsSection = lazy(() =>
  import('@/sections/ShoutoutsSection').then(m => ({ default: m.ShoutoutsSection }))
);
const ResourcesSection = lazy(() =>
  import('@/sections/ResourcesSection').then(m => ({ default: m.ResourcesSection }))
);
const CommunityConnectionsSection = lazy(() =>
  import('@/sections/CommunityConnectionsSection').then(m => ({ default: m.CommunityConnectionsSection }))
);
const WeatherSection = lazy(() =>
  import('@/sections/WeatherSection').then(m => ({ default: m.WeatherSection }))
);
const FarmersMarketSection = lazy(() =>
  import('@/sections/FarmersMarketSection').then(m => ({ default: m.FarmersMarketSection }))
);
const HealthDirectorySection = lazy(() =>
  import('@/sections/HealthDirectorySection').then(m => ({ default: m.HealthDirectorySection }))
);
const BunnyWarrenSection = lazy(() =>
  import('@/sections/BunnyWarrenSection').then(m => ({ default: m.BunnyWarrenSection }))
);
const ContactSection = lazy(() =>
  import('@/sections/ContactSection').then(m => ({ default: m.ContactSection }))
);

// Minimal height-preserving fallback to avoid layout shift while chunks load
function SectionFallback() {
  return <div className="min-h-[50vh]" aria-hidden="true" />;
}

function App() {
  return (
    <div className="relative min-h-screen paper-grain">
      <Navigation />

      <main className="relative">
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <WeatherSection />
        </Suspense>
        <PremiumAdBanner
          sponsorName="HEB"
          sponsorUrl="https://www.heb.com"
          sponsorDisplay="HEB.com"
          mediaSrc="/images/ad-heb.jpg"
          mediaType="image"
        />
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
          <ShoutoutsSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <CommunityConnectionsSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <FarmersMarketSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <HealthDirectorySection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <BunnyWarrenSection />
        </Suspense>
        <PremiumAdBanner
          sponsorName="Minicuration"
          sponsorUrl="http://Minicuration.com"
          sponsorDisplay="Minicuration.com"
          mediaSrc="/images/ad-minicuration.mp4"
          mediaType="video"
        />
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
