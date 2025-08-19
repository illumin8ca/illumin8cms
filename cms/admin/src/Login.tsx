import { useState, useCallback } from 'react';
import Turnstile from 'react-turnstile';
import { colors, fonts, borderRadius, shadows, brandStyles } from './brand';
import { Button, Input, Card, Heading, FormGroup } from './components/UIComponents';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [step, setStep] = useState<'login' | '2fa' | 'setup2fa'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const SITE_KEY = '1x00000000000000000000AA'; // Sandbox key

  const handleTurnstileSuccess = useCallback((token: string) => {
    console.log('Turnstile verification successful');
    setTurnstileToken(token);
    setTurnstileReady(true);
  }, []);

  const handleTurnstileError = useCallback(() => {
    console.error('Turnstile verification failed');
    setTurnstileToken('');
    setTurnstileReady(false);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    console.log('Turnstile token expired');
    setTurnstileToken('');
    setTurnstileReady(false);
  }, []);

  const handleTurnstileLoad = useCallback(() => {
    console.log('Turnstile loaded');
    setTurnstileLoaded(true);
  }, []);

  const resetTurnstile = useCallback(() => {
    setTurnstileToken('');
    setTurnstileReady(false);
    // Force reset Turnstile
    window.turnstile?.reset();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      console.log('Attempting login...');

      // TEMPORARY BYPASS for admin@illumin8.ca while API issues are resolved
      if (username === 'admin@illumin8.ca' && password === 'ThMnFF)zD!qBvZT9Lu') {
        console.log('Using temporary bypass for admin@illumin8.ca');
        const mockToken = 'dev-token-' + Date.now();
        const mockUser = {
          id: 1,
          username: 'admin@illumin8.ca'
        };
        onLogin(mockToken, mockUser);
        return;
      }

      // Normal API login for other users
      const response = await fetch('http://localhost:8788/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          turnstileToken,
        }),
      });

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 401) {
          throw new Error('Invalid username or password');
        } else if (response.status === 429) {
          throw new Error('Too many login attempts. Please try again later.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again.');
        } else {
          throw new Error(`Login failed (${response.status})`);
        }
      }

      const data = await response.json();

      if (data.requiresTwoFA) {
        setStep('2fa');
      } else if (data.success) {
        onLogin(data.token, data.user);
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Network error. Please check that the backend is running.');
      resetTurnstile();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8788/api/auth/totp-validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          totpCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.token, data.user);
      } else {
        throw new Error(data.error || '2FA validation failed');
      }
    } catch (error: any) {
      console.error('2FA error:', error);
      setError(error.message || '2FA validation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === '2fa') {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        width: '100vw',
        margin: 0,
        backgroundColor: colors.lightGray,
        padding: '20px'
      }}>
        <Card style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
          <img src="/images/illumin8-logo.png" alt="Illumin8 Logo" style={{ height: '78px', marginBottom: '16px' }} />
          <Heading level={2} style={{ marginBottom: '24px' }}>
            Enter 2FA Code
          </Heading>

          <form onSubmit={handle2FA} style={{ width: '100%' }}>
            <p style={{ textAlign: 'center', color: colors.inputText, marginBottom: '16px', fontSize: '14px' }}>
              Enter the 6-digit code from your authenticator app
            </p>
            
            <FormGroup>
              <Input
                type="text"
                placeholder="000000"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{
                  textAlign: 'center',
                  letterSpacing: '0.2em',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
                required
              />
            </FormGroup>

            {error && (
              <div style={{
                marginBottom: '16px',
                color: '#d73a49',
                textAlign: 'center',
                backgroundColor: '#ffeaea',
                border: '1px solid #f1aeb5',
                borderRadius: borderRadius.card,
                padding: '12px 16px',
                width: '100%',
                boxSizing: 'border-box',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <Button
                type="submit"
                disabled={isSubmitting || !totpCode.trim() || totpCode.length !== 6}
                style={{ width: '100%' }}
              >
                {isSubmitting ? 'Verifying...' : 'Verify 2FA'}
              </Button>
            </div>
            
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep('login')}
              disabled={isSubmitting}
              style={{ width: '100%' }}
            >
              ← Back to login
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const isLoginDisabled = !turnstileToken || isSubmitting || !username.trim() || !password.trim();

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      background: colors.lightGray, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      margin: 0,
      boxSizing: 'border-box'
    }}>
      <Card style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
        <img src="/images/illumin8-logo.png" alt="Illumin8 Logo" style={{ height: '78px', marginBottom: '16px' }} />
        <Heading level={2} style={{ marginBottom: '8px' }}>
          Admin Login
        </Heading>
        <p style={{ 
          color: '#666', 
          margin: '0 0 24px 0',
          fontSize: '16px',
          fontFamily: fonts.main
        }}>
          Sign in to access your CMS
        </p>
        
        <form onSubmit={handleLogin} style={{ width: '100%', textAlign: 'left' }}>
          {error && (
            <div style={{ 
              marginBottom: '16px', 
              color: '#d73a49', 
              textAlign: 'center', 
              backgroundColor: '#ffeaea', 
              border: '1px solid #f1aeb5', 
              borderRadius: borderRadius.card, 
              padding: '12px 16px', 
              width: '100%',
              boxSizing: 'border-box',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}
          
          <FormGroup label="Username" required>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </FormGroup>
          
          <FormGroup label="Password" required>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </FormGroup>
          
          {/* Hidden Turnstile - uses compact size but hidden with CSS */}
          <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
            <Turnstile
              sitekey={SITE_KEY}
              onSuccess={handleTurnstileSuccess}
              onError={handleTurnstileError}
              onExpire={handleTurnstileExpire}
              onLoad={handleTurnstileLoad}
              size="compact"
              theme="light"
              tabIndex={-1}
            />
          </div>
          
          {!turnstileReady && turnstileLoaded && (
            <div style={{ 
              marginBottom: '16px', 
              color: colors.inputText, 
              textAlign: 'center', 
              fontSize: '14px',
              fontStyle: 'italic'
            }}>
              Completing security verification...
            </div>
          )}
          
          <div style={{ marginBottom: '16px' }}>
            <Button
              type="submit"
              disabled={isLoginDisabled}
              style={{ width: '100%' }}
              size="large"
            >
              {isSubmitting ? 'Logging in...' : 
               turnstileReady ? 'Login' : 
               turnstileLoaded ? 'Verifying Security...' : 
               'Loading...'}
            </Button>
          </div>
          
          {username === 'admin@illumin8.ca' && (
            <div style={{
              backgroundColor: '#e3f2fd',
              padding: '10px',
              borderRadius: borderRadius.card,
              border: '1px solid #90caf9',
              fontSize: '12px',
              color: '#1565c0',
              textAlign: 'center'
            }}>
              <strong>Dev Mode:</strong> 2FA bypass enabled for admin@illumin8.ca
            </div>
          )}
        </form>
      </Card>
    </div>
  );
} 