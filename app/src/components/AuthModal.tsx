import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function AuthModal() {
  const { authModal, closeAuthModal, signIn, signUp } = useAuth()
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')

  // Sync tab when modal opens to a specific tab
  useEffect(() => {
    if (authModal) setTab(authModal)
  }, [authModal])

  // --- sign-in state ---
  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')
  const [siError, setSiError] = useState('')
  const [siLoading, setSiLoading] = useState(false)

  // --- sign-up state ---
  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suConfirm, setSuConfirm] = useState('')
  const [suError, setSuError] = useState('')
  const [suSuccess, setSuSuccess] = useState(false)
  const [suLoading, setSuLoading] = useState(false)

  function resetForms() {
    setSiEmail(''); setSiPassword(''); setSiError('')
    setSuName(''); setSuEmail(''); setSuPassword('')
    setSuConfirm(''); setSuError(''); setSuSuccess(false)
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setSiError('')
    setSiLoading(true)
    const { error } = await signIn(siEmail, siPassword)
    setSiLoading(false)
    if (error) {
      setSiError(
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : error.message,
      )
    } else {
      resetForms()
      closeAuthModal()
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setSuError('')
    if (suPassword !== suConfirm) { setSuError('Passwords do not match.'); return }
    if (suPassword.length < 8) { setSuError('Password must be at least 8 characters.'); return }
    setSuLoading(true)
    const { error } = await signUp(suEmail, suPassword, suName)
    setSuLoading(false)
    if (error) {
      setSuError(error.message)
    } else {
      setSuSuccess(true)
    }
  }

  return (
    <Dialog
      open={authModal !== null}
      onOpenChange={(open) => { if (!open) { resetForms(); closeAuthModal() } }}
    >
      <DialogContent className="sm:max-w-md bg-cream border-espresso/10">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-espresso text-center">
            Hartland Ranch
          </DialogTitle>
          <p className="text-center text-xs text-warm-brown font-mono tracking-widest uppercase">
            Residents Portal
          </p>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'signin' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2 bg-paper-secondary">
            <TabsTrigger value="signin" className="font-mono text-xs data-[state=active]:bg-cream">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="font-mono text-xs data-[state=active]:bg-cream">
              Create Account
            </TabsTrigger>
          </TabsList>

          {/* ── Sign In ── */}
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4 pt-2">
              <Field id="si-email" label="Email">
                <Input
                  id="si-email" type="email" required
                  value={siEmail} onChange={(e) => setSiEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-paper-primary border-espresso/20 focus-visible:ring-vintage-red"
                />
              </Field>
              <Field id="si-password" label="Password">
                <Input
                  id="si-password" type="password" required
                  value={siPassword} onChange={(e) => setSiPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-paper-primary border-espresso/20 focus-visible:ring-vintage-red"
                />
              </Field>
              {siError && <p className="text-xs text-vintage-red">{siError}</p>}
              <Button
                type="submit" disabled={siLoading}
                className="w-full bg-vintage-red hover:bg-vintage-red/90 text-cream font-mono"
              >
                {siLoading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          {/* ── Sign Up ── */}
          <TabsContent value="signup">
            {suSuccess ? (
              <div className="pt-4 pb-2 text-center space-y-3">
                <p className="text-3xl">📬</p>
                <p className="font-display text-lg text-espresso">Check your email</p>
                <p className="text-sm text-warm-brown leading-relaxed">
                  We sent a confirmation link to <strong>{suEmail}</strong>.
                  After confirming, a team member will verify your Hartland Ranch
                  residency before your account is activated.
                </p>
                <Button
                  variant="outline" onClick={() => { resetForms(); closeAuthModal() }}
                  className="font-mono text-xs border-espresso/20"
                >
                  Got it
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4 pt-2">
                <Field id="su-name" label="Username" hint="2–40 characters · visible to other residents">
                  <Input
                    id="su-name" type="text" required minLength={2} maxLength={40}
                    value={suName} onChange={(e) => setSuName(e.target.value)}
                    placeholder="NeighborJane"
                    className="bg-paper-primary border-espresso/20 focus-visible:ring-vintage-red"
                  />
                </Field>
                <Field id="su-email" label="Email">
                  <Input
                    id="su-email" type="email" required
                    value={suEmail} onChange={(e) => setSuEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-paper-primary border-espresso/20 focus-visible:ring-vintage-red"
                  />
                </Field>
                <Field id="su-password" label="Password">
                  <Input
                    id="su-password" type="password" required
                    value={suPassword} onChange={(e) => setSuPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="bg-paper-primary border-espresso/20 focus-visible:ring-vintage-red"
                  />
                </Field>
                <Field id="su-confirm" label="Confirm Password">
                  <Input
                    id="su-confirm" type="password" required
                    value={suConfirm} onChange={(e) => setSuConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="bg-paper-primary border-espresso/20 focus-visible:ring-vintage-red"
                  />
                </Field>
                {suError && <p className="text-xs text-vintage-red">{suError}</p>}
                <Button
                  type="submit" disabled={suLoading}
                  className="w-full bg-vintage-red hover:bg-vintage-red/90 text-cream font-mono"
                >
                  {suLoading ? 'Creating account…' : 'Request Access'}
                </Button>
                <p className="text-xs text-center text-warm-brown/60">
                  Residency verification required. Private community portal.
                </p>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  id, label, hint, children,
}: {
  id: string
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-mono text-warm-brown uppercase tracking-wide">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-warm-brown/60">{hint}</p>}
    </div>
  )
}
