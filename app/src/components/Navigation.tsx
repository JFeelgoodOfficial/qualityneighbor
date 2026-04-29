import { useState, useEffect, useRef } from 'react';
import { Menu, Mail, Lightbulb, LightbulbOff } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { scrollTo } from '@/lib/scroll';
import { useDarkMode } from '@/hooks/useDarkMode';

const navLinks = [
  { label: 'Events', href: '#events' },
  { label: 'Weather', href: '#weather' },
  { label: 'Story', href: '#story' },
  { label: 'Tips', href: '#garden-tip' },
  { label: 'Support Local', href: '#business-ads' },
  { label: 'Community', href: '#community-connections' },
  { label: 'Markets', href: '#farmers-market' },
  { label: 'Health', href: '#health-directory' },
  { label: 'Play', href: '#bunny-warren' },
  { label: 'Contact', href: '#contact' },
];

const sectionIds = ['events', 'weather', 'story', 'garden-tip', 'business-ads', 'community-connections', 'farmers-market', 'health-directory', 'bunny-warren', 'contact'];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { isDark, toggle: toggleDark } = useDarkMode();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active section via IntersectionObserver
  useEffect(() => {
    const sectionEls = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );

    sectionEls.forEach(el => observerRef.current!.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    scrollTo(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-cream/90 backdrop-blur-md shadow-float py-3'
          : 'bg-transparent py-4'
      }`}
    >
      {/* Scroll progress bar */}
      <div
        className="absolute top-0 left-0 h-0.5 bg-vintage-red transition-all duration-75 origin-left"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-display text-lg sm:text-xl font-bold text-espresso"
          >
            QualityNeighbor
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className={`text-sm transition-colors relative ${
                    isActive
                      ? 'text-vintage-red font-medium'
                      : 'text-warm-brown hover:text-espresso'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-vintage-red rounded-full" />
                  )}
                </a>
              );
            })}
            <button
              onClick={toggleDark}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-full hover:bg-paper-secondary transition-colors"
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark
                ? <LightbulbOff className="w-5 h-5 bulb-off transition-all duration-300" />
                : <Lightbulb className="w-5 h-5 bulb-on transition-all duration-300" />
              }
            </button>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#contact');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-vintage-red text-cream text-sm font-medium hover:bg-vintage-red/90 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Subscribe
            </a>
          </nav>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <button className="p-2 rounded-lg hover:bg-paper-secondary transition-colors">
                <Menu className="w-6 h-6 text-espresso" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80 bg-cream border-l border-espresso/10">
              <div className="flex flex-col h-full pt-8">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="font-display text-xl font-bold text-espresso">QualityNeighbor</p>
                    <p className="text-sm text-warm-brown">Hartland Ranch • Lockhart, TX</p>
                  </div>
                  <button
                    onClick={toggleDark}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-espresso hover:bg-paper-secondary transition-colors"
                    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {isDark
                      ? <LightbulbOff className="w-5 h-5 bulb-off transition-all duration-300" />
                      : <Lightbulb className="w-5 h-5 bulb-on transition-all duration-300" />
                    }
                    <span className="font-medium text-sm">{isDark ? 'Light' : 'Dark'}</span>
                  </button>
                </div>

                <nav className="space-y-1 flex-1">
                  {navLinks.map((link) => {
                    const sectionId = link.href.replace('#', '');
                    const isActive = activeSection === sectionId;
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavClick(link.href);
                        }}
                        className={`block px-4 py-3 rounded-xl transition-colors ${
                          isActive
                            ? 'bg-vintage-red/10 text-vintage-red font-medium'
                            : 'text-espresso hover:bg-paper-secondary'
                        }`}
                      >
                        {link.label}
                      </a>
                    );
                  })}
                </nav>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('#contact');
                  }}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-vintage-red text-cream font-medium hover:bg-vintage-red/90 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Subscribe to Newsletter
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
