import { lazy, Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { QuickActionButton } from '@/components/QuickActionButton';
import { PremiumAdBanner } from '@/components/PremiumAdBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import { HeroSection } from '@/sections/HeroSection';
import './App.css';


// Below-fold sections are lazy-loaded to reduce initial JS parse time
const EventsSection = lazy(() =>
  import('@/sections/EventsSection').then(m => ({ default: m.EventsSection }))
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
        <ErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <WeatherSection />
          </Suspense>
        </ErrorBoundary>
        <PremiumAdBanner
          sponsorName="HEB"
          sponsorUrl="https://www.heb.com"
          sponsorDisplay="HEB.com"
          mediaSrc="/images/ad-heb.jpg"
          mediaType="image"
        />
        <ErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <EventsSection />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <StorySection />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <GardenTipSection />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <BusinessAdsSection />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <CommunityConnectionsSection />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <FarmersMarketSection />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <HealthDirectorySection />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <BunnyWarrenSection />
          </Suspense>
        </ErrorBoundary>
        <PremiumAdBanner
          sponsorName="Minicuration"
          sponsorUrl="http://Minicuration.com"
          sponsorDisplay="Minicuration.com"
          mediaSrc="/images/ad-minicuration.mp4"
          mediaType="video"
        />
        <ErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <ResourcesSection />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <ContactSection />
          </Suspense>
        </ErrorBoundary>
      </main>

      <QuickActionButton />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default App;
