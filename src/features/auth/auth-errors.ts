export function isEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function authErrorMessage(error: unknown) {
  if (error instanceof Error && error.name === 'SupabaseConfigurationError') {
    return error.message;
  }
  if (!error || typeof error !== 'object') {
    return 'We couldn’t complete that request. Please try again.';
  }

  const candidate = error as { code?: string; message?: string; status?: number };
  const code = candidate.code?.toLowerCase() ?? '';
  const message = candidate.message?.toLowerCase() ?? '';

  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return 'That email and password combination didn’t work. Check them and try again.';
  }
  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return 'Please verify your email before signing in.';
  }
  if (
    code === 'weak_password' ||
    message.includes('password should be') ||
    message.includes('password is too')
  ) {
    return 'Choose a stronger password that meets your project’s password requirements.';
  }
  if (
    code.includes('rate_limit') ||
    code.includes('over_email_send_rate_limit') ||
    message.includes('rate limit')
  ) {
    return 'Too many attempts. Please wait a little while and try again.';
  }
  if (
    message.includes('network request failed') ||
    message.includes('failed to fetch') ||
    message.includes('network error')
  ) {
    return 'We couldn’t reach Twin. Check your internet connection and try again.';
  }
  if (
    code.includes('provider_disabled') ||
    code.includes('unsupported_provider') ||
    message.includes('provider is not enabled')
  ) {
    return 'Google sign-in isn’t enabled for this project yet.';
  }
  if (candidate.status === 429) {
    return 'Too many attempts. Please wait a little while and try again.';
  }
  return 'We couldn’t complete that request. Please try again.';
}

export function hasErrorCode(error: unknown, code: string) {
  return (
    !!error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code?: string }).code === code
  );
}
