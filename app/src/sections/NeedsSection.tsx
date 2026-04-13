import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HandHeart, Search, Package, MessageCircle, Plus, MapPin, Clock, Check, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { VerificationModal } from '@/components/VerificationModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

gsap.registerPlugin(ScrollTrigger);

type NeedCategory = 'all' | 'help' | 'offer' | 'find';

interface Need {
  id: string;
  title: string;
  description: string;
  category: Exclude<NeedCategory, 'all'>;
  location?: string;
  time?: string;
  author: string;
}

type PendingAction =
  | { type: 'reply'; needId: string }
  | { type: 'post' }
  | null;

const seedNeeds: Need[] = [
  {
    id: '1',
    title: 'Need help moving a sofa',
    description: 'Looking for an extra pair of hands to help move a couch from the garage to the living room.',
    category: 'help',
    time: 'Saturday morning',
    author: 'Mike R.',
  },
  {
    id: '2',
    title: 'Offering tomatoes & peppers',
    description: 'Garden overflow! Fresh heirloom tomatoes and bell peppers available for pickup.',
    category: 'offer',
    location: 'Near the trail',
    author: 'Sarah K.',
  },
  {
    id: '3',
    title: 'Lost: set of keys',
    description: 'Lost my keys somewhere near the playground. Has a blue lanyard and house key.',
    category: 'find',
    location: 'Near the playground',
    author: 'Jenny M.',
  },
  {
    id: '4',
    title: 'Looking for a ladder',
    description: 'Need to borrow an extension ladder for a day to clean gutters.',
    category: 'find',
    time: 'Borrow for a day',
    author: 'Tom B.',
  },
  {
    id: '5',
    title: 'Dog walking swap?',
    description: 'Looking for a neighbor to swap dog walking duties on weekday afternoons.',
    category: 'offer',
    time: 'Weekday afternoons',
    author: 'Lisa P.',
  },
  {
    id: '6',
    title: 'Ride to the farmers market',
    description: 'Looking for a ride to the Lockhart Farmers Market this Saturday.',
    category: 'help',
    time: 'Saturday 9am',
    author: 'Carlos D.',
  },
];

const categoryConfig = {
  help: { label: 'Help', icon: HandHeart, color: 'bg-amber-100 text-amber-800' },
  offer: { label: 'Offer', icon: Package, color: 'bg-emerald-100 text-emerald-800' },
  find: { label: 'Find', icon: Search, color: 'bg-blue-100 text-blue-800' },
};

// ---------------------------------------------------------------------------
// Post-a-Need form dialog
// ---------------------------------------------------------------------------

interface PostNeedDialogProps {
  open: boolean;
  verifiedEmail: string;
  onSubmit: (need: Need) => void;
  onClose: () => void;
}

function PostNeedDialog({ open, verifiedEmail, onSubmit, onClose }: PostNeedDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Exclude<NeedCategory, 'all'>>('help');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = () => {
    setTitle(''); setDescription(''); setCategory('help');
    setLocation(''); setTime(''); setErrors({});
  };

  useEffect(() => { if (open) reset(); }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required.';
    if (!description.trim()) errs.description = 'Description is required.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const authorName = verifiedEmail.split('@')[0]
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    onSubmit({
      id: String(Date.now()),
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim() || undefined,
      time: time.trim() || undefined,
      author: authorName,
    });
    onClose();
  };

  const fieldClass = "w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 bg-white text-espresso placeholder:text-warm-brown/40";
  const fieldStyle = { borderColor: 'hsl(var(--espresso) / 0.15)', '--tw-ring-color': 'hsl(var(--vintage-red) / 0.3)' } as React.CSSProperties;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        className="max-w-md"
        style={{ background: 'hsl(var(--cream))', borderColor: 'hsl(var(--espresso) / 0.1)' }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-[hsl(var(--espresso))]">Post a need</DialogTitle>
          <DialogDescription className="text-[hsl(var(--warm-brown))]">
            Posting as <span className="font-medium text-[hsl(var(--espresso))]">{verifiedEmail}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Category */}
          <div className="flex gap-2">
            {(['help', 'offer', 'find'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                  category === cat
                    ? 'bg-[hsl(var(--vintage-red))] text-[hsl(var(--cream))]'
                    : 'bg-[hsl(var(--paper-secondary))] text-[hsl(var(--warm-brown))] hover:bg-[hsl(var(--warm-brown)/0.15)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })); }}
              placeholder="What do you need?"
              className={fieldClass}
              style={fieldStyle}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })); }}
              placeholder="A little more detail…"
              rows={3}
              className={`${fieldClass} resize-none`}
              style={fieldStyle}
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
          </div>

          {/* Location + Time (optional) */}
          <div className="grid grid-cols-2 gap-2">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (optional)"
              className={fieldClass}
              style={fieldStyle}
            />
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="When (optional)"
              className={fieldClass}
              style={fieldStyle}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border text-sm font-medium text-[hsl(var(--warm-brown))] transition-colors hover:bg-[hsl(var(--paper-secondary))]"
              style={{ borderColor: 'hsl(var(--espresso) / 0.15)' }}
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 vintage-red-btn text-sm">
              Post
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------

export function NeedsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const [activeFilter, setActiveFilter] = useState<NeedCategory>('all');
  const [helpfulIds, setHelpfulIds] = useLocalStorage<string[]>('helpful-needs', []);
  const [needs, setNeeds] = useState<Need[]>(seedNeeds);

  // Verification state
  const { isVerified, verifiedEmail, markVerified } = useEmailVerification();
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  // Per-card reply state
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [repliedIds, setRepliedIds] = useState<Record<string, boolean>>({});

  // Post-a-need dialog
  const [postNeedOpen, setPostNeedOpen] = useState(false);

  const filteredNeeds = activeFilter === 'all'
    ? needs
    : needs.filter(n => n.category === activeFilter);

  // Gate an action behind verification
  const requireVerified = (action: PendingAction, fn: () => void) => {
    if (isVerified) { fn(); } else {
      setPendingAction(action);
      setVerifyModalOpen(true);
    }
  };

  const handleVerified = (email: string) => {
    markVerified(email);
    setVerifyModalOpen(false);
    if (pendingAction?.type === 'reply') {
      setOpenReplies(prev => ({ ...prev, [pendingAction.needId]: true }));
    } else if (pendingAction?.type === 'post') {
      setPostNeedOpen(true);
    }
    setPendingAction(null);
  };

  const handleReply = (needId: string) => {
    requireVerified({ type: 'reply', needId }, () =>
      setOpenReplies(prev => ({ ...prev, [needId]: true }))
    );
  };

  const handleSubmitReply = (needId: string) => {
    const text = replyText[needId]?.trim();
    if (!text) return;
    setRepliedIds(prev => ({ ...prev, [needId]: true }));
    setOpenReplies(prev => ({ ...prev, [needId]: false }));
    toast.success('Reply sent!', { description: `Sent as ${verifiedEmail}` });
  };

  const handlePostNeed = () => {
    requireVerified({ type: 'post' }, () => setPostNeedOpen(true));
  };

  const toggleHelpful = (id: string) => {
    setHelpfulIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: 18, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.5, ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 75%', toggleActions: 'play none none reverse' },
        }
      );

      const cards = cardsRef.current?.querySelectorAll('.need-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0, scale: 0.98 },
          {
            y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out',
            scrollTrigger: { trigger: cardsRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="needs"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12"
      style={{ background: 'hsl(var(--paper-primary))' }}
    >
      {/* Header with filters */}
      <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
        <div className="section-header mb-0">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-espresso pb-4">
            Neighborly Needs
          </h2>
          <div className="w-44 h-0.5 bg-espresso/20" />
          <p className="mt-3 text-warm-brown">
            Post a request, offer a hand, or list something to find.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'help', 'offer', 'find'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter
                    ? 'bg-vintage-red text-cream'
                    : 'bg-paper-secondary text-warm-brown hover:bg-warm-brown/20'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Verified badge */}
          {isVerified && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
              <Check className="w-3.5 h-3.5" />
              Verified as {verifiedEmail}
            </span>
          )}
        </div>
      </div>

      {/* Needs Grid */}
      <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNeeds.map((need) => {
          const config = categoryConfig[need.category];
          const Icon = config.icon;
          const isHelpful = helpfulIds.includes(need.id);
          const isReplyOpen = openReplies[need.id];
          const hasReplied = repliedIds[need.id];

          return (
            <div
              key={need.id}
              className="need-card paper-card rounded-xl p-5 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300"
            >
              {/* Category badge + helpful toggle */}
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {config.label}
                </span>
                <button
                  onClick={() => toggleHelpful(need.id)}
                  className={`text-xs flex items-center gap-1 transition-colors ${
                    isHelpful ? 'text-vintage-red' : 'text-warm-brown/60 hover:text-warm-brown'
                  }`}
                >
                  <HandHeart className={`w-4 h-4 ${isHelpful ? 'fill-current' : ''}`} />
                  {isHelpful ? 'Helpful' : 'Mark helpful'}
                </button>
              </div>

              {/* Content */}
              <h3 className="font-display text-lg font-semibold text-espresso mb-2">
                {need.title}
              </h3>
              <p className="text-sm text-warm-brown leading-relaxed mb-4">
                {need.description}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap gap-3 text-xs text-warm-brown/70 mb-4">
                {need.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {need.location}
                  </span>
                )}
                {need.time && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {need.time}
                  </span>
                )}
              </div>

              {/* Action row */}
              <div className="pt-3 border-t border-espresso/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-warm-brown/60">Posted by {need.author}</span>

                  {hasReplied ? (
                    <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" /> Reply sent
                    </span>
                  ) : (
                    <button
                      onClick={() => handleReply(need.id)}
                      className="flex items-center gap-1.5 text-sm text-vintage-red font-medium hover:underline"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {isReplyOpen ? 'Replying…' : 'Reply'}
                    </button>
                  )}
                </div>

                {/* Inline reply form */}
                {isReplyOpen && !hasReplied && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={replyText[need.id] ?? ''}
                      onChange={(e) => setReplyText(prev => ({ ...prev, [need.id]: e.target.value }))}
                      placeholder="Write your reply…"
                      rows={2}
                      autoFocus
                      className="w-full px-3 py-2 text-sm rounded-lg border resize-none focus:outline-none focus:ring-2"
                      style={{
                        background: 'white',
                        borderColor: 'hsl(var(--espresso) / 0.15)',
                        color: 'hsl(var(--espresso))',
                        '--tw-ring-color': 'hsl(var(--vintage-red) / 0.3)',
                      } as React.CSSProperties}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSubmitReply(need.id)}
                        disabled={!replyText[need.id]?.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cream bg-vintage-red disabled:opacity-40 transition-opacity"
                      >
                        <Send className="w-3.5 h-3.5" /> Send
                      </button>
                      <button
                        onClick={() => setOpenReplies(prev => ({ ...prev, [need.id]: false }))}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-warm-brown hover:text-espresso transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Post a Need CTA */}
      <div className="mt-8">
        <button
          onClick={handlePostNeed}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-warm-brown/30 text-warm-brown font-medium hover:border-vintage-red hover:text-vintage-red transition-colors"
        >
          <Plus className="w-5 h-5" />
          Post a need
        </button>
      </div>

      {/* Modals */}
      <VerificationModal
        open={verifyModalOpen}
        onVerified={handleVerified}
        onClose={() => { setVerifyModalOpen(false); setPendingAction(null); }}
      />

      <PostNeedDialog
        open={postNeedOpen}
        verifiedEmail={verifiedEmail ?? ''}
        onSubmit={(need) => {
          setNeeds(prev => [need, ...prev]);
          toast.success('Need posted!', { description: 'Your neighbors can now see it.' });
        }}
        onClose={() => setPostNeedOpen(false)}
      />
    </section>
  );
}
