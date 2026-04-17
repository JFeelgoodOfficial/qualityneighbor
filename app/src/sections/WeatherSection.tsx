import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Cloud, Wind, Thermometer, RefreshCw, AlertCircle } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ForecastPeriod {
  name: string;
  temperature: number;
  temperatureUnit: string;
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  icon: string;
  isDaytime: boolean;
}

interface WeatherState {
  periods: ForecastPeriod[];
  updated: string;
  error: string | null;
  loading: boolean;
}

// Lockhart TX NWS grid: EWX 156,88 — derived from api.weather.gov/points/29.8842,-97.6703
const FORECAST_URL = 'https://api.weather.gov/gridpoints/EWX/156,88/forecast';

function WeatherIcon({ iconUrl, alt }: { iconUrl: string; alt: string }) {
  return (
    <img
      src={iconUrl}
      alt={alt}
      className="w-12 h-12 object-contain"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}

export function WeatherSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [weather, setWeather] = useState<WeatherState>({
    periods: [],
    updated: '',
    error: null,
    loading: true,
  });

  const fetchWeather = async () => {
    setWeather(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(FORECAST_URL, {
        headers: { 'User-Agent': 'QualityNeighbor/1.0 (hartlandranch.com)' },
      });
      if (!res.ok) throw new Error(`NWS API ${res.status}`);
      const data = await res.json();
      const periods: ForecastPeriod[] = data.properties.periods.slice(0, 8);
      const updated = new Date(data.properties.updateTime).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
      });
      setWeather({ periods, updated, error: null, loading: false });
    } catch {
      setWeather(prev => ({
        ...prev,
        loading: false,
        error: 'Unable to load forecast. Check back shortly.',
      }));
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion || weather.loading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 78%', toggleActions: 'play none none reverse' },
        }
      );
      const cards = cardRef.current?.querySelectorAll('.weather-day');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 18, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.35, stagger: 0.06, ease: 'power2.out',
            scrollTrigger: { trigger: cardRef.current, start: 'top 72%', toggleActions: 'play none none reverse' },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion, weather.loading]);

  // Pair day + night into single day entries for the 4-day view
  const dayPairs = weather.periods.reduce<ForecastPeriod[][]>((acc, p) => {
    if (p.isDaytime) acc.push([p]);
    else if (acc.length > 0) acc[acc.length - 1].push(p);
    return acc;
  }, []).slice(0, 4);

  return (
    <section
      ref={sectionRef}
      id="weather"
      className="relative w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-secondary))' }}
    >
      <div ref={cardRef} className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cloud className="w-4 h-4 text-vintage-red" />
              <span className="font-mono text-xs uppercase tracking-wider text-warm-brown">
                Local Weather · Lockhart, TX
              </span>
            </div>
            {weather.updated && (
              <p className="text-xs text-warm-brown/60">Updated {weather.updated}</p>
            )}
          </div>
          <button
            onClick={fetchWeather}
            aria-label="Refresh weather"
            className={`p-2 rounded-full text-warm-brown hover:text-espresso hover:bg-paper-primary transition-colors ${weather.loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {weather.error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-vintage-red/10 border border-vintage-red/20 text-vintage-red mb-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{weather.error}</p>
          </div>
        )}

        {weather.loading && !weather.error && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="paper-card rounded-xl p-4 h-32 animate-pulse bg-paper-primary/60" />
            ))}
          </div>
        )}

        {!weather.loading && dayPairs.length > 0 && (
          <>
            {/* Today featured */}
            {dayPairs[0] && (
              <div className="paper-card rounded-2xl p-5 mb-4 flex items-center gap-5">
                <WeatherIcon iconUrl={dayPairs[0][0].icon} alt={dayPairs[0][0].shortForecast} />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs uppercase tracking-wider text-warm-brown mb-0.5">Today</p>
                  <p className="font-display text-3xl font-bold text-espresso">
                    {dayPairs[0][0].temperature}°{dayPairs[0][0].temperatureUnit}
                    {dayPairs[0][1] && (
                      <span className="text-lg font-normal text-warm-brown ml-2">
                        / {dayPairs[0][1].temperature}°
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-warm-brown mt-0.5">{dayPairs[0][0].shortForecast}</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1 text-xs text-warm-brown/70">
                  <span className="flex items-center gap-1">
                    <Wind className="w-3 h-3" />
                    {dayPairs[0][0].windSpeed} {dayPairs[0][0].windDirection}
                  </span>
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3" />
                    {dayPairs[0][0].temperatureUnit === 'F' ? 'Fahrenheit' : 'Celsius'}
                  </span>
                </div>
              </div>
            )}

            {/* 3-day outlook */}
            <div className="grid grid-cols-3 gap-3">
              {dayPairs.slice(1).map((pair, i) => (
                <div key={i} className="weather-day paper-card rounded-xl p-4 text-center">
                  <p className="font-mono text-xs uppercase tracking-wider text-warm-brown/70 mb-2">
                    {pair[0].name}
                  </p>
                  <WeatherIcon iconUrl={pair[0].icon} alt={pair[0].shortForecast} />
                  <p className="font-bold text-espresso mt-2">
                    {pair[0].temperature}°
                    {pair[1] && <span className="font-normal text-warm-brown text-sm"> / {pair[1].temperature}°</span>}
                  </p>
                  <p className="text-xs text-warm-brown/70 mt-1 leading-tight">{pair[0].shortForecast}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="text-xs text-warm-brown/40 text-right mt-3">
          Forecast data: National Weather Service (weather.gov)
        </p>
      </div>
    </section>
  );
}
