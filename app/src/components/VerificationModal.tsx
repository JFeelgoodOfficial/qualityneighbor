import { useState, useEffect } from 'react';
import { Mail, ShieldCheck, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

// ---------------------------------------------------------------------------
// OTP helpers
// ---------------------------------------------------------------------------

const OTP_SESSION_KEY = 'qn-pending-otp';
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

interface StoredOTP {
  code: string;
  email: string;
  expiresAt: number;
}

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function storeOTP(email: string, code: string) {
  const data: StoredOTP = { code, email, expiresAt: Date.now() + OTP_EXPIRY_MS };
  sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify(data));
}

function validateOTP(inputCode: string): StoredOTP | null {
  try {
    const raw = sessionStorage.getItem(OTP_SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredOTP;
    if (Date.now() > data.expiresAt) {
      sessionStorage.removeItem(OTP_SESSION_KEY);
      return null;
    }
    if (data.code !== inputCode) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Sends the OTP via EmailJS when env vars are configured.
 * Falls back to console + dev banner when they aren't (local dev / demo).
 *
 * Required env vars (in .env or hosting provider):
 *   VITE_EMAILJS_SERVICE_ID
 *   VITE_EMAILJS_TEMPLATE_ID   (template must expose: to_email, otp_code, neighborhood)
 *   VITE_EMAILJS_PUBLIC_KEY
 */
async function sendOTPEmail(email: string, code: string): Promise<void> {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;

  if (!serviceId || !templateId || !publicKey) {
    // EmailJS not configured — dev / demo mode, code visible on screen
    console.info(`[QN Dev] OTP for ${email}: ${code}`);
    return;
  }

  const emailjs = await import('@emailjs/browser');
  await emailjs.send(
    serviceId,
    templateId,
    { to_email: email, otp_code: code, neighborhood: 'Hartland Ranch' },
    publicKey,
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Step = 'email' | 'code' | 'success';

export interface VerificationModalProps {
  open: boolean;
  onVerified: (email: string) => void;
  onClose: () => void;
}

export function VerificationModal({ open, onVerified, onClose }: VerificationModalProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sending, setSending] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  // Reset state whenever modal is opened
  useEffect(() => {
    if (open) {
      setStep('email');
      setEmail('');
      setEmailError('');
      setOtp('');
      setOtpError('');
      setDevCode(null);
    }
  }, [open]);

  // Auto-verify as soon as all 6 digits are entered
  useEffect(() => {
    if (otp.length === 6 && step === 'code') {
      handleVerifyCode(otp);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleSendCode = async () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setSending(true);
    try {
      const code = generateOTP();
      storeOTP(trimmed, code);
      await sendOTPEmail(trimmed, code);
      const isDevMode = !import.meta.env.VITE_EMAILJS_SERVICE_ID;
      if (isDevMode) setDevCode(code);
      setStep('code');
    } catch (err) {
      setEmailError('Failed to send code. Please try again.');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = (code: string) => {
    const stored = validateOTP(code);
    if (!stored) {
      setOtpError('Incorrect or expired code. Try again.');
      setOtp('');
      return;
    }
    sessionStorage.removeItem(OTP_SESSION_KEY);
    setStep('success');
    setTimeout(() => onVerified(stored.email), 1000);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm" style={{ background: 'hsl(var(--cream))', borderColor: 'hsl(var(--espresso) / 0.1)' }}>

        {/* ── Step 1: Email entry ── */}
        {step === 'email' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[hsl(var(--vintage-red))]" />
                <DialogTitle className="font-display text-[hsl(var(--espresso))]">
                  Confirm you're a neighbor
                </DialogTitle>
              </div>
              <DialogDescription className="text-[hsl(var(--warm-brown))]">
                Enter your email to receive a one-time verification code.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                  placeholder="you@example.com"
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: 'white',
                    borderColor: 'hsl(var(--espresso) / 0.15)',
                    color: 'hsl(var(--espresso))',
                    '--tw-ring-color': 'hsl(var(--vintage-red) / 0.3)',
                  } as React.CSSProperties}
                />
                {emailError && (
                  <p className="mt-1.5 text-xs text-red-600">{emailError}</p>
                )}
              </div>
              <button
                onClick={handleSendCode}
                disabled={sending}
                className="vintage-red-btn w-full flex items-center justify-center gap-2 text-sm"
              >
                {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                {sending ? 'Sending…' : 'Send verification code'}
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: OTP entry ── */}
        {step === 'code' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[hsl(var(--vintage-red))]" />
                <DialogTitle className="font-display text-[hsl(var(--espresso))]">
                  Enter your code
                </DialogTitle>
              </div>
              <DialogDescription className="text-[hsl(var(--warm-brown))]">
                We sent a 6-digit code to{' '}
                <span className="font-medium text-[hsl(var(--espresso))]">{email}</span>.
              </DialogDescription>
            </DialogHeader>

            {/* Dev-mode banner — only shows when EmailJS isn't configured */}
            {devCode && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <span className="font-medium">Dev mode</span> — EmailJS not configured.
                Your code is{' '}
                <span className="font-mono font-bold tracking-widest text-amber-900">
                  {devCode}
                </span>
              </div>
            )}

            <div className="flex flex-col items-center gap-3">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(v) => { setOtp(v); setOtpError(''); }}
                autoFocus
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              {otpError && <p className="text-xs text-red-600">{otpError}</p>}
              <button
                onClick={() => { setStep('email'); setOtp(''); }}
                className="text-xs transition-colors"
                style={{ color: 'hsl(var(--warm-brown) / 0.6)' }}
              >
                Wrong email? Go back
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Success ── */}
        {step === 'success' && (
          <div className="py-4 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="font-display text-lg font-semibold text-[hsl(var(--espresso))]">
              Verified!
            </p>
            <p className="text-sm text-[hsl(var(--warm-brown))]">{email}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
