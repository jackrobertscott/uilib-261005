import { useState, type FormEvent } from 'react';
import { ArrowLeft, Mail, MailCheck, KeyRound } from 'lucide-react';
import { Alert, Button, Card, Checkbox, Field, Heading, Input, Link, PinInput, Radio, RadioGroup, Stack, Text, toast } from '@ui';
import { uid, type Gender } from './data';
import { useStore } from './store';
import { Logo } from './Logo';

const validEmail = (e: string) => /.+@.+\..+/.test(e);

/** Welcome → Login / Sign up → Verify email, plus Forgot password. Any password works in the demo. */
export function AuthScreen() {
  const s = useStore();
  const step = s.auth!;
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ first: '', last: '', gender: 'female' as Gender, password: '', terms: false });
  const [code, setCode] = useState('');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const go = (next: typeof step) => {
    setError(null);
    s.setAuth(next);
  };
  const existing = () => s.db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  const wait = (fn: () => void) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      fn();
    }, 600);
  };

  const submitWelcome = (e: FormEvent) => {
    e.preventDefault();
    if (!validEmail(email)) return setError('Enter a valid email address.');
    wait(() => go(existing() ? 'login' : 'signup'));
  };
  const submitLogin = (e: FormEvent) => {
    e.preventDefault();
    const u = existing();
    if (!u) return setError('No account uses that email. Check the spelling or sign up.');
    if (!form.password) return setError('Enter your password.');
    wait(() => {
      s.signIn(u.id);
      toast.success(`Welcome back, ${u.firstName}`);
    });
  };
  const submitSignup = (e: FormEvent) => {
    e.preventDefault();
    if (!form.first.trim() || !form.last.trim()) return setError('Enter your first and last name.');
    if (form.password.length < 8) return setError('Use at least 8 characters for your password.');
    if (!form.terms) return setError('Please accept the league terms to continue.');
    wait(() => {
      const id = uid('usr');
      s.update((db) => ({
        ...db,
        users: [...db.users, { id, firstName: form.first.trim(), lastName: form.last.trim(), email: email.trim(), gender: form.gender, verified: false, createdOn: new Date() }],
      }));
      setPendingUserId(id);
      go('verify');
    });
  };
  const submitVerify = (value = code) => {
    if (value.length < 6) return setError('Enter the 6-digit code from your email.');
    wait(() => {
      const id = pendingUserId ?? s.user?.id;
      if (id) {
        s.update((db) => ({ ...db, users: db.users.map((u) => (u.id === id ? { ...u, verified: true } : u)) }));
        s.signIn(id);
      } else s.setAuth(null);
      toast.success('Email verified', { description: 'Next, join a team so you can report scores.' });
    });
  };
  const submitForgot = (e: FormEvent) => {
    e.preventDefault();
    if (!resetSent) {
      if (!validEmail(email)) return setError('Enter a valid email address.');
      return wait(() => setResetSent(true));
    }
    if (code.length < 6) return setError('Enter the 6-digit code from your email.');
    if (form.password.length < 8) return setError('Use at least 8 characters for your new password.');
    wait(() => {
      toast.success('Password updated', { description: 'Log in with your new password.' });
      setResetSent(false);
      setCode('');
      go('login');
    });
  };

  const field = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="fr-auth">
      <div className="fr-auth__inner">
        <Stack align="center" gap={3}>
          <Logo size={56} />
          <Text weight="semibold">Perth Ultimate League</Text>
        </Stack>
        <Card padding="lg" className="fr-auth__card">
          {step === 'welcome' && (
            <form onSubmit={submitWelcome} noValidate>
              <Stack gap={5}>
                <Stack gap={1}>
                  <Heading level={1} size="xl">Welcome</Heading>
                  <Text size="sm" tone="tertiary">Enter your email to log in or create an account.</Text>
                </Stack>
                <Field label="Email" error={error}>
                  <Input type="email" leading={<Mail />} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
                </Field>
                <Button type="submit" variant="primary" fullWidth loading={loading}>Continue</Button>
                <Text size="xs" tone="tertiary" style={{ textAlign: 'center' }}>Try <b>admin@example.com</b> to log in as the league admin.</Text>
              </Stack>
            </form>
          )}

          {step === 'login' && (
            <form onSubmit={submitLogin} noValidate>
              <Stack gap={5}>
                <Stack gap={1}>
                  <Heading level={1} size="xl">Log in</Heading>
                  <Text size="sm" tone="tertiary">Welcome back! Enter your details.</Text>
                </Stack>
                {error && <Alert tone="danger">{error}</Alert>}
                <Field label="Email">
                  <Input type="email" leading={<Mail />} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </Field>
                <Field label="Password" labelAside={<Link href="#" subtle onClick={(e) => { e.preventDefault(); go('forgot'); }}>Forgot password?</Link>}>
                  <Input type="password" value={form.password} onChange={field('password')} placeholder="••••••••" />
                </Field>
                <Button type="submit" variant="primary" fullWidth loading={loading}>Log in</Button>
                <Text size="sm" tone="tertiary" style={{ textAlign: 'center' }}>
                  New to the league? <Link href="#" onClick={(e) => { e.preventDefault(); go('signup'); }}>Create an account</Link>
                </Text>
              </Stack>
            </form>
          )}

          {step === 'signup' && (
            <form onSubmit={submitSignup} noValidate>
              <Stack gap={4}>
                <Stack gap={1}>
                  <Heading level={1} size="xl">Create your account</Heading>
                  <Text size="sm" tone="tertiary">Players need an account to join a team and report scores.</Text>
                </Stack>
                {error && <Alert tone="danger">{error}</Alert>}
                <Field label="Email">
                  <Input type="email" leading={<Mail />} value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <div className="fr-grid-2">
                  <Field label="First name"><Input value={form.first} onChange={field('first')} autoComplete="given-name" /></Field>
                  <Field label="Last name"><Input value={form.last} onChange={field('last')} autoComplete="family-name" /></Field>
                </div>
                <Field label="Gender" description="Used for MVP voting in mixed divisions.">
                  <RadioGroup orientation="horizontal" value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v as Gender })}>
                    <Radio value="female" label="Female" />
                    <Radio value="male" label="Male" />
                  </RadioGroup>
                </Field>
                <Field label="Password" description="At least 8 characters.">
                  <Input type="password" value={form.password} onChange={field('password')} />
                </Field>
                <Checkbox checked={form.terms} onCheckedChange={(v) => setForm({ ...form, terms: v })} label="I agree to the league terms and code of conduct" />
                <Button type="submit" variant="primary" fullWidth loading={loading}>Sign up</Button>
                <Text size="sm" tone="tertiary" style={{ textAlign: 'center' }}>
                  Already have an account? <Link href="#" onClick={(e) => { e.preventDefault(); go('login'); }}>Log in</Link>
                </Text>
              </Stack>
            </form>
          )}

          {step === 'verify' && (
            <Stack gap={5}>
              <span className="ui-icon-tile"><MailCheck /></span>
              <Stack gap={1}>
                <Heading level={1} size="xl">Verify your email</Heading>
                <Text size="sm" tone="tertiary">We sent a 6-digit code to <b>{email || s.user?.email}</b>.</Text>
              </Stack>
              <Field label="Verification code" error={error}>
                <PinInput value={code} onValueChange={setCode} onComplete={submitVerify} groupSize={3} />
              </Field>
              <Button variant="primary" fullWidth loading={loading} onClick={() => submitVerify()}>Verify email</Button>
              <Text size="sm" tone="tertiary">
                Didn’t get it? <Link href="#" onClick={(e) => { e.preventDefault(); toast('Code resent'); }}>Resend code</Link>
              </Text>
            </Stack>
          )}

          {step === 'forgot' && (
            <form onSubmit={submitForgot} noValidate>
              <Stack gap={5}>
                <span className="ui-icon-tile"><KeyRound /></span>
                <Stack gap={1}>
                  <Heading level={1} size="xl">Reset your password</Heading>
                  <Text size="sm" tone="tertiary">
                    {resetSent ? <>Enter the code sent to <b>{email}</b> and choose a new password.</> : 'We’ll email you a recovery code.'}
                  </Text>
                </Stack>
                {error && <Alert tone="danger">{error}</Alert>}
                {!resetSent ? (
                  <Field label="Email">
                    <Input type="email" leading={<Mail />} value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Field>
                ) : (
                  <>
                    <Field label="Recovery code"><PinInput value={code} onValueChange={setCode} groupSize={3} /></Field>
                    <Field label="New password"><Input type="password" value={form.password} onChange={field('password')} /></Field>
                  </>
                )}
                <Button type="submit" variant="primary" fullWidth loading={loading}>{resetSent ? 'Update password' : 'Send code'}</Button>
              </Stack>
            </form>
          )}
        </Card>
        <Button variant="ghost" size="sm" leading={<ArrowLeft />} onClick={() => (step === 'welcome' || step === 'verify' ? s.setAuth(null) : go('welcome'))} className="fr-auth__back">
          {step === 'welcome' || step === 'verify' ? 'Back to home' : 'Back'}
        </Button>
      </div>
    </div>
  );
}
