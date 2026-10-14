import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import type { Session, VerifyOtpParams } from '@supabase/supabase-js';

import { getSupabase } from '@/lib/supabase';

const validOtpTypes: VerifyOtpParams['type'][] = [
  'signup',
  'recovery',
  'invite',
  'magiclink',
  'email',
  'email_change',
];
const pendingExchanges = new Map<string, Promise<Session>>();

export function authRedirectUrl(path: 'auth/callback' | 'auth/reset-password') {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return new URL(`/${path}`, window.location.origin).toString();
  }
  return Linking.createURL(path);
}

export async function handleAuthRedirect(redirectUrl: string) {
  let url: URL;
  try {
    url = new URL(redirectUrl);
  } catch {
    throw new Error('This sign-in link is invalid. Request a new link and try again.');
  }

  const params = new URLSearchParams(url.search);
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
  const providerError = params.get('error_description') ?? params.get('error');
  if (providerError) {
    throw new Error('This sign-in link could not be completed. Request a new link and try again.');
  }

  const code = params.get('code');
  if (code) {
    return exchangeCode(code);
  }

  const tokenHash = params.get('token_hash');
  const otpType = params.get('type') as VerifyOtpParams['type'] | null;
  if (tokenHash && otpType && validOtpTypes.includes(otpType)) {
    const { data, error } = await getSupabase().auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });
    if (error || !data.session) {
      throw new Error('This verification link has expired or is invalid. Request a new one.');
    }
    return data.session;
  }

  if (hashParams.get('error')) {
    throw new Error('This sign-in link could not be completed. Request a new link and try again.');
  }
  throw new Error('This sign-in link is incomplete or has expired. Request a new one and try again.');
}

function exchangeCode(code: string) {
  const existing = pendingExchanges.get(code);
  if (existing) {
    return existing;
  }
  const exchange = getSupabase().auth.exchangeCodeForSession(code).then(({ data, error }) => {
    if (error || !data.session) {
      throw new Error('This sign-in link has expired or is invalid. Request a new one.');
    }
    return data.session;
  });
  pendingExchanges.set(code, exchange);
  setTimeout(() => pendingExchanges.delete(code), 30_000);
  return exchange;
}
