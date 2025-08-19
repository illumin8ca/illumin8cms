import React, { useState } from 'react';
import { colors, fonts, borderRadius, shadows } from './brand';

const Setup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simple password strength check
  const getPasswordStrength = (pw: string) => {
    if (pw.length < 8) return 'Weak';
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) return 'Strong';
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 'Medium';
    return 'Weak';
  };
  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (passwordStrength === 'Weak') {
      setError('Password is too weak. Please use at least 8 characters with uppercase, numbers, and special characters.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch('http://localhost:8788/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(), 
          password, 
          email: email.trim() || undefined 
        }),
      });
      
      if (!res.ok) {
        let errorMessage = 'Setup failed. Please try again.';
        try {
          const data = await res.json();
          errorMessage = data.error || errorMessage;
        } catch {
          if (res.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
        }
        setError(errorMessage);
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError('Setup failed. Please try again.');
      }
    } catch (err) {
      console.error('Setup error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', width: '100vw', background: colors.lightGray, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: colors.white, padding: 48, borderRadius: borderRadius.card, boxShadow: shadows.subtle, maxWidth: 600, width: '100%', textAlign: 'center', fontFamily: fonts.main }}>
          <img src="/images/illumin8-logo.png" alt="Illumin8 Logo" style={{ height: 78, marginBottom: 24 }} />
          <h2 style={{ color: colors.black, fontWeight: fonts.headingWeight, fontSize: 28, marginBottom: 16 }}>Setup Complete!</h2>
          <p style={{ color: colors.black, fontSize: 18, marginBottom: 24 }}>You can now log in with your new admin account.</p>
          <a href="/admin/login" style={{ background: colors.yellow, color: colors.black, border: `4px solid ${colors.orange}`, borderRadius: borderRadius.pill, fontWeight: 'bold', padding: '12px 32px', textDecoration: 'none', fontFamily: fonts.main }}>Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: colors.lightGray, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <form
        style={{ background: colors.white, padding: 48, borderRadius: borderRadius.card, boxShadow: shadows.subtle, width: '100%', maxWidth: 600, fontFamily: fonts.main }}
        onSubmit={handleSubmit}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <img src="/images/illumin8-logo.png" alt="Illumin8 Logo" style={{ height: 78 }} />
        </div>
        <h2 style={{ fontSize: 32, fontWeight: fonts.headingWeight, textAlign: 'center', marginBottom: 32, color: colors.black }}>Initial Admin Setup</h2>
        {error && <div style={{ marginBottom: 16, color: 'red', textAlign: 'center', fontSize: 16 }}>{error}</div>}
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', marginBottom: 32 }}>
          <div>
            <label style={{ fontWeight: fonts.subheadingWeight, marginBottom: 12, display: 'block', fontSize: 16, color: colors.black }}>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              style={{ fontSize: fonts.bodySize, lineHeight: fonts.bodyLineHeight, color: colors.inputText, background: colors.inputBg, border: `2px solid ${colors.inputBorder}`, borderRadius: borderRadius.pill, padding: '14px 20px', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: fonts.main }}
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          <div>
            <label style={{ fontWeight: fonts.subheadingWeight, marginBottom: 12, display: 'block', fontSize: 16, color: colors.black }}>(Optional) Email</label>
            <input
              type="email"
              placeholder="Enter your email address"
              style={{ fontSize: fonts.bodySize, lineHeight: fonts.bodyLineHeight, color: colors.inputText, background: colors.inputBg, border: `2px solid ${colors.inputBorder}`, borderRadius: borderRadius.pill, padding: '14px 20px', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: fonts.main }}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', marginBottom: 32 }}>
          <div>
            <label style={{ fontWeight: fonts.subheadingWeight, marginBottom: 12, display: 'block', fontSize: 16, color: colors.black }}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              style={{ fontSize: fonts.bodySize, lineHeight: fonts.bodyLineHeight, color: colors.inputText, background: colors.inputBg, border: `2px solid ${colors.inputBorder}`, borderRadius: borderRadius.pill, padding: '14px 20px', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: fonts.main }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <div style={{ marginTop: 8, fontSize: 14, color: passwordStrength === 'Strong' ? 'green' : passwordStrength === 'Medium' ? 'orange' : 'red', fontWeight: 'bold' }}>
              Password strength: {passwordStrength}
            </div>
          </div>
          
          <div>
            <label style={{ fontWeight: fonts.subheadingWeight, marginBottom: 12, display: 'block', fontSize: 16, color: colors.black }}>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              style={{ fontSize: fonts.bodySize, lineHeight: fonts.bodyLineHeight, color: colors.inputText, background: colors.inputBg, border: `2px solid ${colors.inputBorder}`, borderRadius: borderRadius.pill, padding: '14px 20px', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: fonts.main }}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            style={{ background: colors.yellow, color: colors.black, border: `4px solid ${colors.orange}`, borderRadius: borderRadius.pill, fontWeight: 'bold', fontStyle: 'normal', textTransform: 'none', textDecoration: 'none', padding: '16px 48px', fontSize: 18, transition: 'border-color 0.3s ease, box-shadow 0.3s ease', boxShadow: isSubmitting ? shadows.subtle : undefined, cursor: isSubmitting ? 'not-allowed' : 'pointer', fontFamily: fonts.main }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Setting up...' : 'Create Admin Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Setup; 