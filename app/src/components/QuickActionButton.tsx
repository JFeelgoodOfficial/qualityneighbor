import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Plus, PenTool, Store, X } from 'lucide-react';

interface ActionItem {
  label: string;
  icon: typeof Plus;
  href: string;
  color: string;
}

const actions: ActionItem[] = [
  { label: 'Submit a Story', icon: PenTool, href: '#story', color: 'bg-blue-500' },
  { label: 'Claim a Free Ad', icon: Store, href: '#business-ads', color: 'bg-emerald-500' },
];

export function QuickActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (menuRef.current && buttonRef.current) {
      const items = menuRef.current.querySelectorAll('.action-item');

      if (isOpen) {
        gsap.to(items, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.3,
          stagger: 0.05,
          ease: 'back.out(1.7)',
        });
      } else {
        gsap.to(items, {
          y: 20,
          opacity: 0,
          scale: 0.8,
          duration: 0.2,
          stagger: 0.03,
          ease: 'power2.in',
        });
      }
    }
  }, [isOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (href: string) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Action Menu */}
      <div
        ref={menuRef}
        className={`absolute bottom-16 right-0 space-y-2 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => handleActionClick(action.href)}
              className={`action-item flex items-center gap-3 px-4 py-3 rounded-xl bg-cream shadow-card hover:shadow-card-hover transition-all opacity-0 translate-y-5 scale-80 whitespace-nowrap`}
            >
              <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-espresso">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-float flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-espresso text-cream rotate-45'
            : 'bg-vintage-red text-cream hover:scale-105'
        }`}
        aria-label={isOpen ? 'Close menu' : 'Open quick actions'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
}
