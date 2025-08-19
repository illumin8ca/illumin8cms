import React, { useState, useEffect } from 'react';
import { colors, fonts, borderRadius, shadows } from './brand';

function toDataURL(url: string) {
  // Use Google Charts API for QR code
  return `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(url)}`;
}

interface TwoFactorSetupProps {
  username: string;
  onSuccess: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ username, onSuccess }) => {
  const [secret, setSecret] = useState('');
  const [otpauth, setOtpauth] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'setup' | 'verifying' | 'done'>('setup');

  useEffect(() => {
    fetch('/api/auth/totp-setup', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setSecret(data.secret);
        setOtpauth(data.otpauth);
      });
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const res = await fetch('/api/auth/totp-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, code, secret }),
    });
    const data = await res.json();
    setIsSubmitting(false);
    if (data.success) {
      setStep('done');
      onSuccess();
    } else {
      setError(data.error || 'Invalid code');
    }
  };

  if (step === 'done') {
    return (
      <div style={{ textAlign: 'center', fontFamily: fonts.main }}>
        <h2 style={{ color: colors.black, fontWeight: fonts.headingWeight, fontSize: 24, marginBottom: 16 }}>2FA Enabled!</h2>
        <p style={{ color: colors.black, fontSize: 18, marginBottom: 24 }}>You have successfully enabled two-factor authentication.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleVerify} style={{ background: colors.white, padding: 32, borderRadius: borderRadius.card, boxShadow: shadows.subtle, maxWidth: 400, width: '100%', fontFamily: fonts.main, margin: '40px auto' }}>
      <h2 style={{ fontSize: 28, fontWeight: fonts.headingWeight, textAlign: 'center', marginBottom: 24, color: colors.black }}>Set Up Two-Factor Authentication</h2>
      <p style={{ color: colors.black, fontSize: 16, marginBottom: 16 }}>Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.), or enter the secret manually.</p>
      {otpauth && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <img src={toDataURL(otpauth)} alt="2FA QR Code" style={{ width: 200, height: 200 }} />
      </div>}
      <div style={{ marginBottom: 16, textAlign: 'center', fontFamily: 'monospace', fontSize: 18, color: colors.black }}>{secret}</div>
      <label style={{ fontWeight: fonts.subheadingWeight, marginBottom: 4, display: 'block' }}>Enter 6-digit code from your app</label>
      <input
        type="text"
        style={{ fontSize: fonts.bodySize, lineHeight: fonts.bodyLineHeight, color: colors.inputText, background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: borderRadius.pill, padding: '10px 20px', width: '100%', marginBottom: 16, boxSizing: 'border-box', outline: 'none', fontFamily: fonts.main }}
        value={code}
        onChange={e => setCode(e.target.value)}
        required
        maxLength={6}
        pattern="[0-9]{6}"
        inputMode="numeric"
      />
      {error && <div style={{ marginBottom: 16, color: 'red', textAlign: 'center' }}>{error}</div>}
      <button
        type="submit"
        style={{ width: '100%', background: colors.yellow, color: colors.black, border: `4px solid ${colors.orange}`, borderRadius: borderRadius.pill, fontWeight: 'bold', fontStyle: 'normal', textTransform: 'none', textDecoration: 'none', padding: '12px 0', fontSize: 18, transition: 'border-color 0.3s ease, box-shadow 0.3s ease', boxShadow: isSubmitting ? shadows.subtle : undefined, cursor: isSubmitting ? 'not-allowed' : 'pointer', marginBottom: 8, fontFamily: fonts.main }}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Verifying...' : 'Enable 2FA'}
      </button>
    </form>
  );
};

export default TwoFactorSetup; 