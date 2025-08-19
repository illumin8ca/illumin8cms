import bcrypt from 'bcryptjs';
import { sign } from '@tsndr/cloudflare-worker-jwt';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
  'Access-Control-Max-Age': '86400',
};

// Handle OPTIONS requests for CORS preflight
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
};

// Handle POST requests for login
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    console.log('Login attempt received');
    
    const { username, password, turnstileToken } = await request.json();
    
    if (!username || !password || !turnstileToken) {
      console.log('Missing required fields');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        }
      });
    }

    console.log('Searching for user:', username);
    
    // Check if user exists and get password hash
    let user;
    try {
      // Try with totp_secret column first
      user = await env.DB.prepare(
        'SELECT id, username, password_hash, totp_secret FROM users WHERE username = ? LIMIT 1'
      ).bind(username).first();
    } catch (error) {
      console.log('totp_secret column not found, trying without it');
      // Fallback for when totp_secret column doesn't exist yet
      user = await env.DB.prepare(
        'SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1'
      ).bind(username).first();
    }

    if (!user) {
      console.log('User not found');
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        }
      });
    }

    console.log('User found, checking password');
    
    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      console.log('Invalid password');
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        }
      });
    }

    console.log('Password valid');

    // Check if 2FA is enabled and if we should bypass it for admin@illumin8.ca
    const shouldBypassTwoFA = username === 'admin@illumin8.ca';
    const twoFAEnabled = user.totp_secret && !shouldBypassTwoFA;

    console.log('2FA enabled:', twoFAEnabled, 'Bypassing for admin@illumin8.ca:', shouldBypassTwoFA);

    if (twoFAEnabled) {
      // User has 2FA enabled, require TOTP verification
      return new Response(JSON.stringify({ 
        requiresTwoFA: true,
        message: 'Please enter your authenticator code'
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        }
      });
    }

    // Either no 2FA or bypassing for admin@illumin8.ca - proceed with login
    console.log('Generating JWT token');
    
    const token = await sign({
      sub: user.id.toString(),
      username: user.username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    }, env.JWT_SECRET || 'dev-secret-key');

    console.log('Login successful');

    return new Response(JSON.stringify({ 
      success: true, 
      token,
      user: {
        id: user.id,
        username: user.username
      }
    }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Login failed. Please try again.' }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      }
    });
  }
}; 