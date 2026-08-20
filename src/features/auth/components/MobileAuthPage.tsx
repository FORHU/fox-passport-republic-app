'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
  useLogin, useSignup, useForgotPassword,
  useVerifyEmail, useResendOtp,
} from '@/features/auth/hooks/useAuth';
import {
  loginSchema, LoginFormData,
  signupSchema, SignupFormData,
} from '@/shared/lib/schema';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

// ─── Types ────────────────────────────────────────────────────────────────────

type View = 'login' | 'signup' | 'forgot' | 'verify';

// ─── Shared atoms ─────────────────────────────────────────────────────────────

const FIELD: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 14, padding: '14px 16px',
  color: '#fff', fontSize: 14, outline: 'none',
};

const FIELD_ERR: React.CSSProperties = {
  ...FIELD, border: '1px solid rgba(239,68,68,0.6)',
};

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <span style={{ fontSize: 10, color: '#ef4444', marginTop: 3, display: 'block' }}>{msg}</span>;
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.08em' }}>OR</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
    </div>
  );
}

function GoogleButton({ disabled }: { disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: '1.5px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 700, borderRadius: 14, padding: '12px 0', cursor: 'pointer', boxSizing: 'border-box' }}
      onClick={() => toast.info('Google sign-in coming soon.')}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
        <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
        <path d="M9 3.583c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.583 9 3.583z" fill="#EA4335" />
      </svg>
      Continue with Google
    </button>
  );
}

// ─── Login View ───────────────────────────────────────────────────────────────

function LoginView({ onSignup, onForgot }: { onSignup: () => void; onForgot: () => void }) {
  const loginMutation = useLogin();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  });

  const onSubmit = (data: LoginFormData) => loginMutation.mutate(data);

  return (
    <div style={{ marginTop: 'auto', padding: '0 24px 44px' }}>
      <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#ccff00', marginBottom: 8 }}>Welcome Back</p>
      <h1 style={{ fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)', fontSize: 27, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 24 }}>
        Log in to<br />your account
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
        <div>
          <input {...register('email')} type="email" placeholder="Email address"
            style={errors.email ? FIELD_ERR : FIELD} autoComplete="email" />
          <FieldError msg={errors.email?.message} />
        </div>

        <div>
          <div style={{ position: 'relative' }}>
            <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="Password"
              style={{ ...(errors.password ? FIELD_ERR : FIELD), paddingRight: 48 }} autoComplete="current-password" />
            <button type="button" onClick={() => setShowPw(p => !p)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', lineHeight: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {showPw ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          <FieldError msg={errors.password?.message} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4 }}>
          <button type="button" onClick={onForgot}
            style={{ fontSize: 11, fontWeight: 700, color: '#ccff00', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Forgot password?
          </button>
        </div>

        <button type="submit" disabled={loginMutation.isPending}
          style={{ background: '#ccff00', color: '#000', fontSize: 14, fontWeight: 800, borderRadius: 16, padding: '14px 0', border: 'none', cursor: loginMutation.isPending ? 'not-allowed' : 'pointer', opacity: loginMutation.isPending ? 0.7 : 1, boxShadow: '0 4px 20px rgba(204,255,0,0.3)', marginTop: 4 }}>
          {loginMutation.isPending ? 'Logging in…' : 'Log In'}
        </button>
      </form>

      <Divider />
      <GoogleButton disabled={loginMutation.isPending} />

      <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 20 }}>
        New here?{' '}
        <button onClick={onSignup} style={{ color: '#ccff00', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: 0 }}>
          Create an account
        </button>
      </p>
    </div>
  );
}

// ─── Signup View ──────────────────────────────────────────────────────────────

function SignupView({ onLogin, onSignedUp }: { onLogin: () => void; onSignedUp: () => void }) {
  const signupMutation = useSignup();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onSubmit',
  });

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate(data, { onSuccess: () => onSignedUp() });
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 44px' }}>
      <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#ccff00', marginBottom: 8 }}>Join the Hype</p>
      <h1 style={{ fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)', fontSize: 27, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
        Create your<br />account
      </h1>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Unlock exclusive events and meet your crew.</p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Full Name</label>
          <input {...register('name')} type="text" placeholder="e.g. Fox Mulder"
            style={errors.name ? FIELD_ERR : FIELD} autoComplete="name" />
          <FieldError msg={errors.name?.message} />
        </div>

        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Email Address</label>
          <input {...register('email')} type="email" placeholder="name@example.com"
            style={errors.email ? FIELD_ERR : FIELD} autoComplete="email" />
          <FieldError msg={errors.email?.message} />
        </div>

        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Username</label>
          <input {...register('username')} type="text" placeholder="fox_mulder"
            style={errors.username ? FIELD_ERR : FIELD} autoComplete="username" />
          <FieldError msg={errors.username?.message} />
        </div>

        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="Min. 16 characters"
              style={{ ...(errors.password ? FIELD_ERR : FIELD), paddingRight: 48 }} autoComplete="new-password" />
            <button type="button" onClick={() => setShowPw(p => !p)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', lineHeight: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {showPw ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errors.password
            ? <FieldError msg={errors.password.message} />
            : <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, display: 'block' }}>16+ chars · uppercase · lowercase · digit · special (@$!%*?&)</span>
          }
        </div>

        {/* Terms */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 4 }}>
          <input type="checkbox" required style={{ marginTop: 2, accentColor: '#ccff00', width: 16, height: 16, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
            I agree to the{' '}
            <span style={{ color: '#ccff00', fontWeight: 700 }}>Terms of Service</span>{' '}
            &{' '}
            <span style={{ color: '#ccff00', fontWeight: 700 }}>Privacy Policy</span>
          </span>
        </label>

        <button type="submit" disabled={signupMutation.isPending}
          style={{ background: '#ccff00', color: '#000', fontSize: 14, fontWeight: 800, borderRadius: 16, padding: '14px 0', border: 'none', cursor: signupMutation.isPending ? 'not-allowed' : 'pointer', opacity: signupMutation.isPending ? 0.7 : 1, boxShadow: '0 4px 20px rgba(204,255,0,0.3)', marginTop: 4 }}>
          {signupMutation.isPending ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>

      <Divider />
      <GoogleButton disabled={signupMutation.isPending} />

      <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 20 }}>
        Already a member?{' '}
        <button onClick={onLogin} style={{ color: '#ccff00', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: 0 }}>
          Log in
        </button>
      </p>
    </div>
  );
}

// ─── Forgot Password View ─────────────────────────────────────────────────────

function ForgotView({ onBack }: { onBack: () => void }) {
  const forgotMutation = useForgotPassword();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    forgotMutation.mutate(email, { onSuccess: () => setSent(true) });
  };

  return (
    <div style={{ marginTop: 'auto', padding: '0 24px 44px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 28, padding: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
        Back to login
      </button>

      <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#ccff00', marginBottom: 8 }}>Reset Password</p>
      <h1 style={{ fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)', fontSize: 27, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
        Forgot your<br />password?
      </h1>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Enter your email and we'll send a reset code.</p>

      {sent ? (
        <div style={{ background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.25)', borderRadius: 16, padding: '20px 18px', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#ccff00', display: 'block', marginBottom: 10 }}>mark_email_read</span>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Check your inbox</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>We sent a reset code to <strong style={{ color: '#fff' }}>{email}</strong>. Check your spam folder if you don't see it.</p>
        </div>
      ) : (
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email address" style={FIELD} autoComplete="email" />
          <button type="submit" disabled={forgotMutation.isPending || !email.trim()}
            style={{ background: '#ccff00', color: '#000', fontSize: 14, fontWeight: 800, borderRadius: 16, padding: '14px 0', border: 'none', cursor: (forgotMutation.isPending || !email.trim()) ? 'not-allowed' : 'pointer', opacity: (forgotMutation.isPending || !email.trim()) ? 0.7 : 1, boxShadow: '0 4px 20px rgba(204,255,0,0.3)' }}>
            {forgotMutation.isPending ? 'Sending…' : 'Send Reset Code'}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Verify Email View ────────────────────────────────────────────────────────

function VerifyView({ onVerified }: { onVerified: () => void }) {
  const { pendingEmail } = useAuthStore();
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendOtp();
  const [otp, setOtp] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6 || !pendingEmail) return;
    verifyMutation.mutate({ email: pendingEmail, otpCode: otp }, {
      onSuccess: () => {
        if (typeof window !== 'undefined') localStorage.setItem('fp_new_user', 'true');
        toast.success('Email verified! Please log in to continue.');
        onVerified();
      },
    });
  };

  return (
    <div style={{ marginTop: 'auto', padding: '0 24px 44px' }}>
      <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#ccff00', marginBottom: 8 }}>One More Step</p>
      <h1 style={{ fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)', fontSize: 27, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
        Verify your<br />email
      </h1>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
        Enter the 6-digit code sent to{' '}
        <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{pendingEmail}</strong>.
      </p>

      <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          style={{ ...FIELD, fontSize: 24, fontWeight: 700, textAlign: 'center', letterSpacing: '0.3em' }}
        />

        <button type="submit" disabled={verifyMutation.isPending || otp.length < 6}
          style={{ background: '#ccff00', color: '#000', fontSize: 14, fontWeight: 800, borderRadius: 16, padding: '14px 0', border: 'none', cursor: (verifyMutation.isPending || otp.length < 6) ? 'not-allowed' : 'pointer', opacity: (verifyMutation.isPending || otp.length < 6) ? 0.7 : 1, boxShadow: '0 4px 20px rgba(204,255,0,0.3)' }}>
          {verifyMutation.isPending ? 'Verifying…' : 'Verify Email'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          Didn't receive it?{' '}
          <button
            onClick={() => pendingEmail && resendMutation.mutate(pendingEmail)}
            disabled={resendMutation.isPending || !pendingEmail}
            style={{ color: '#ccff00', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: 0, opacity: resendMutation.isPending ? 0.5 : 1 }}>
            {resendMutation.isPending ? 'Sending…' : 'Resend code'}
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function MobileAuthPage() {
  const [view, setView] = useState<View>('login');

  return (
    <div style={{ background: '#050608', minHeight: '100svh', position: 'relative', overflow: 'hidden' }}>
      {/* Background radial gradient */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(204,255,0,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100svh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
        {/* Logo */}
        <div style={{ paddingTop: 68, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)', fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>FoxPassport</span>
        </div>

        {/* View content */}
        {view === 'login' && (
          <LoginView onSignup={() => setView('signup')} onForgot={() => setView('forgot')} />
        )}
        {view === 'signup' && (
          <SignupView onLogin={() => setView('login')} onSignedUp={() => setView('verify')} />
        )}
        {view === 'forgot' && (
          <ForgotView onBack={() => setView('login')} />
        )}
        {view === 'verify' && (
          <VerifyView onVerified={() => setView('login')} />
        )}
      </div>
    </div>
  );
}
