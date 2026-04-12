import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, PenTool, HandHeart, Store, Send } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

gsap.registerPlugin(ScrollTrigger);

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useLocalStorage<boolean>('newsletter-subscribed', false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Content animation
      gsap.fromTo(
        contentRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Form animation
      const form = contentRef.current?.querySelector('form');
      if (form) {
        gsap.fromTo(
          form,
          { scale: 0.98, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-secondary))' }}
    >
      <div ref={contentRef} className="max-w-2xl mx-auto text-center">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-espresso mb-4">
          Stay in the loop
        </h2>
        <p className="text-warm-brown mb-8 max-w-md mx-auto">
          Get the next issue delivered to your inbox. No spam—just neighborhood news.
        </p>

        {/* Subscription Form */}
        {!isSubscribed ? (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-10">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-brown/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-cream border border-espresso/10 text-espresso placeholder:text-warm-brown/50 focus:outline-none focus:ring-2 focus:ring-vintage-red/30"
                required
              />
            </div>
            <button type="submit" className="vintage-red-btn flex items-center justify-center gap-2">
              Subscribe
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="max-w-md mx-auto mb-10 p-4 rounded-xl bg-emerald-100 text-emerald-800">
            <p className="font-medium">Thanks for subscribing!</p>
            <p className="text-sm">Watch your inbox for the next issue.</p>
          </div>
        )}

        {/* Quick Action Links */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <a
            href="#needs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream text-espresso hover:bg-vintage-red hover:text-cream transition-colors"
          >
            <HandHeart className="w-4 h-4" />
            Post a need
          </a>
          <a
            href="#story"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream text-espresso hover:bg-vintage-red hover:text-cream transition-colors"
          >
            <PenTool className="w-4 h-4" />
            Submit a story
          </a>
          <a
            href="#business-ads"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream text-espresso hover:bg-vintage-red hover:text-cream transition-colors"
          >
            <Store className="w-4 h-4" />
            Claim a free ad
          </a>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-espresso/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <p className="font-display font-bold text-espresso">QualityNeighbor</p>
              <p className="text-sm text-warm-brown">Hartland Ranch • Lockhart, TX</p>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <a href="#" className="text-warm-brown hover:text-espresso transition-colors">
                Privacy
              </a>
              <a href="#" className="text-warm-brown hover:text-espresso transition-colors">
                Contact
              </a>
            </div>
          </div>

          <p className="mt-6 text-xs text-warm-brown/60">
            © 2026 QualityNeighbor. Built for Hartland Ranch.
          </p>
        </footer>
      </div>
    </section>
  );
}
