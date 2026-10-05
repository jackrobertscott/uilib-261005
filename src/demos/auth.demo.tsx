import { useState } from 'react';
import { Asterisk, Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { Avatar, AvatarGroup, Button, Checkbox, Divider, Field, Heading, Input, Link, PinInput, Stack, Text, toast } from '@ui';
import { defineStories } from '../workbench/types';
import { people } from '../stories/_data';
import '../demos/demos.css';

function AuthPage() {
  const [step, setStep] = useState<'signin' | 'code'>('signin');
  const [email, setEmail] = useState('caitlyn@untitledui.com');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) return setError('Enter a valid email address.');
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('code');
    }, 900);
  };

  return (
    <div className="demo-auth">
      <div className="demo-auth__form">
        <div className="demo-auth__inner">
          <Stack direction="row" gap={2} align="center">
            <span className="ui-icon-tile"><Asterisk /></span>
            <Text weight="semibold">Untitled UI</Text>
          </Stack>
          {step === 'signin' ? (
            <>
              <Stack gap={2}>
                <Heading level={1} size="2xl">Log in to your account</Heading>
                <Text tone="tertiary" size="sm">Welcome back! Please enter your details.</Text>
              </Stack>
              <Stack direction="row" gap={3}>
                <Button fullWidth leading={<GoogleMark />}>Google</Button>
                <Button fullWidth leading={<KeyRound />}>SSO</Button>
              </Stack>
              <Divider label="or" />
              <form onSubmit={submit} noValidate>
                <Stack gap={4}>
                  <Field label="Email" error={error}>
                    <Input leading={<Mail />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                  </Field>
                  <Field label="Password" labelAside={<Link href="#" subtle onClick={(e) => { e.preventDefault(); toast('Reset link sent'); }}>Forgot password?</Link>}>
                    <Input type="password" defaultValue="supersecret" />
                  </Field>
                  <Checkbox label="Remember me for 30 days" defaultChecked />
                  <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>Sign in</Button>
                </Stack>
              </form>
              <Text size="sm" tone="tertiary" style={{ textAlign: 'center' }}>
                Don’t have an account? <Link href="#">Sign up</Link>
              </Text>
            </>
          ) : (
            <>
              <Stack gap={2}>
                <Heading level={1} size="2xl">Check your email</Heading>
                <Text tone="tertiary" size="sm">We sent a verification code to <b>{email}</b>.</Text>
              </Stack>
              <PinInput onComplete={(v) => { toast.success(`Signed in with ${v}`); }} groupSize={3} />
              <Button variant="primary" size="lg" fullWidth onClick={() => toast.success('Verified')}>Verify email</Button>
              <Text size="sm" tone="tertiary">
                Didn’t receive it? <Link href="#" onClick={(e) => { e.preventDefault(); toast('Code resent'); }}>Click to resend</Link>
              </Text>
              <Button variant="ghost" leading={<ArrowLeft />} onClick={() => setStep('signin')} style={{ alignSelf: 'flex-start' }}>Back to log in</Button>
            </>
          )}
        </div>
      </div>
      <div className="demo-auth__art">
        <p className="demo-auth__quote">“We moved 40,000 files in a weekend and nobody noticed — the calmest migration we’ve ever done.”</p>
        <Stack direction="row" gap={3} align="center">
          <AvatarGroup size="sm">
            {people.slice(0, 4).map((p) => <Avatar key={p.id} size="sm" src={p.avatar} name={p.name} />)}
          </AvatarGroup>
          <Text size="sm" style={{ color: 'inherit', opacity: 0.8 }}>Join 4,000+ teams</Text>
        </Stack>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.8h3.6c2-1.9 3.2-4.7 3.2-8.1z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 10z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z" />
    </svg>
  );
}

export default defineStories({
  id: 'demo-auth',
  title: 'Sign in',
  group: 'Demos',
  order: 4,
  fullPage: true,
  stories: [{ name: 'Sign in', render: () => <AuthPage /> }],
});
