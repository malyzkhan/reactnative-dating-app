import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';

import { authErrorMessage, hasErrorCode, isEmailAddress } from '@/features/auth/auth-errors';
import {
  authRedirectUrl,
  handleAuthRedirect,
} from '@/features/auth/auth-redirect';
import {
  AuthButton,
  AuthDivider,
  AuthError,
  AuthField,
  AuthGoogleButton,
  AuthLayout,
  AuthNotice,
  AuthTextLink,
  PasswordGuidance,
} from '@/features/auth/auth-ui';
import { useAuth } from '@/features/auth/auth-provider';
import { getSupabase } from '@/lib/supabase';

type GoogleStatus = 'idle' | 'loading';

WebBrowser.maybeCompleteAuthSession();

function useGoogleSignIn() {
  const [status, setStatus] = useState<GoogleStatus>('idle');
  const [error, setError] = useState('');

  const signIn = async () => {
    if (status === 'loading') {
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const redirectTo = authRedirectUrl('auth/callback');
      const { data, error: oauthError } = await getSupabase().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (oauthError) {
        throw oauthError;
      }
      if (!data.url) {
        throw new Error('Google sign-in could not be started.');
      }
      if (Platform.OS === 'web') {
        window.location.assign(data.url);
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === 'cancel' || result.type === 'dismiss') {
        return;
      }
      if (result.type !== 'success' || !result.url) {
        throw new Error('Google sign-in did not return a completed callback.');
      }
      await handleAuthRedirect(result.url);
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      setStatus('idle');
    }
  };

  return { signIn, status: status === 'loading', error };
}

export function SignInScreen() {
  const { initializationError, retryInitialization } = useAuth();
  const google = useGoogleSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (busy) {
      return;
    }
    const normalizedEmail = email.trim();
    if (!isEmailAddress(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { error: signInError } = await getSupabase().auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (signInError) {
        if (hasErrorCode(signInError, 'email_not_confirmed')) {
          router.push({ pathname: '/verification-pending', params: { email: normalizedEmail } });
          return;
        }
        throw signInError;
      }
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="YOUR NEXT CHAPTER"
      title="Welcome\nback."
      description="Sign in to return to your Twin account.">
      <AuthError>{initializationError || error || google.error}</AuthError>
      {initializationError ? (
        <AuthButton title="Retry connection" onPress={retryInitialization} secondary />
      ) : null}
      <AuthField
        label="Email"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setError('');
        }}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        returnKeyType="next"
        textContentType="emailAddress"
        placeholder="you@example.com"
      />
      <AuthField
        label="Password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setError('');
        }}
        autoCapitalize="none"
        autoComplete="current-password"
        returnKeyType="done"
        textContentType="password"
        placeholder="Your password"
        secure
      />
      <AuthTextLink label="Forgot password?" onPress={() => router.push('/forgot-password')} />
      <AuthButton
        title="Sign in"
        onPress={() => void submit()}
        loading={busy}
        disabled={google.status}
      />
      <AuthDivider />
      <AuthGoogleButton onPress={() => void google.signIn()} loading={google.status || busy} />
      <AuthTextLink label="New to Twin? Create an account" onPress={() => router.push('/sign-up')} />
    </AuthLayout>
  );
}

export function SignUpScreen() {
  const google = useGoogleSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (busy) {
      return;
    }
    const normalizedEmail = email.trim();
    if (!isEmailAddress(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!password || !confirmation) {
      setError('Enter and confirm your password.');
      return;
    }
    if (password.length < 8) {
      setError('Your password must be at least 8 characters.');
      return;
    }
    if (password !== confirmation) {
      setError('The passwords don’t match.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const { data, error: signUpError } = await getSupabase().auth.signUp({
        email: normalizedEmail,
        password,
        options: { emailRedirectTo: authRedirectUrl('auth/callback') },
      });
      if (signUpError) {
        throw signUpError;
      }
      if (!data.session) {
        router.replace({ pathname: '/verification-pending', params: { email: normalizedEmail } });
      }
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="A MORE THOUGHTFUL WAY TO MEET"
      title="Create your\naccount."
      description="Start with an account. You can shape your profile when you’re ready.">
      <AuthError>{error || google.error}</AuthError>
      <AuthField
        label="Email"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setError('');
        }}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        returnKeyType="next"
        textContentType="emailAddress"
        placeholder="you@example.com"
      />
      <AuthField
        label="Password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setError('');
        }}
        autoCapitalize="none"
        autoComplete="new-password"
        returnKeyType="next"
        textContentType="newPassword"
        placeholder="At least 8 characters"
        secure
      />
      <PasswordGuidance />
      <AuthField
        label="Confirm password"
        value={confirmation}
        onChangeText={(value) => {
          setConfirmation(value);
          setError('');
        }}
        autoCapitalize="none"
        autoComplete="new-password"
        returnKeyType="done"
        textContentType="newPassword"
        placeholder="Enter your password again"
        secure
      />
      <AuthButton
        title="Create account"
        onPress={() => void submit()}
        loading={busy}
        disabled={google.status}
      />
      <AuthDivider />
      <AuthGoogleButton onPress={() => void google.signIn()} loading={google.status || busy} />
      <AuthTextLink label="Already have an account? Sign in" onPress={() => router.replace('/sign-in')} />
    </AuthLayout>
  );
}

export function VerificationPendingScreen() {
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const email = Array.isArray(params.email) ? params.email[0] : params.email ?? '';
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setTimeout(() => setCooldown((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resend = async () => {
    if (busy || cooldown > 0 || !isEmailAddress(email)) {
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { error: resendError } = await getSupabase().auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: authRedirectUrl('auth/callback') },
      });
      if (resendError) {
        throw resendError;
      }
      setNotice('If this account needs confirmation, a fresh verification email is on its way.');
      setCooldown(60);
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="ONE LAST STEP"
      title="Check your\ninbox."
      description={email
        ? `If an account needs verification, we’ve sent instructions to ${email}.`
        : 'Open the verification link in the email you received to finish setting up your account.'}>
      <AuthNotice>{notice}</AuthNotice>
      <AuthError>{error}</AuthError>
      {isEmailAddress(email) ? (
        <AuthButton
          title={cooldown ? `Send again in ${cooldown}s` : 'Resend verification email'}
          onPress={() => void resend()}
          loading={busy}
          disabled={cooldown > 0}
          secondary
        />
      ) : null}
      <AuthButton title="Return to sign in" onPress={() => router.replace('/sign-in')} />
      <AuthTextLink label="Back to Twin introduction" onPress={() => router.replace('/')} />
    </AuthLayout>
  );
}

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (busy) {
      return;
    }
    const normalizedEmail = email.trim();
    if (!isEmailAddress(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { error: resetError } = await getSupabase().auth.resetPasswordForEmail(
        normalizedEmail,
        { redirectTo: authRedirectUrl('auth/reset-password') },
      );
      if (resetError) {
        throw resetError;
      }
      setSent(true);
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="ACCOUNT RECOVERY"
      title="Let’s get you\nback in."
      description={sent
        ? 'If an account matches that address, a password reset link is on its way.'
        : 'Enter the email address you used for Twin and we’ll send a reset link if an account matches.'}>
      <AuthError>{error}</AuthError>
      {sent ? (
        <AuthButton title="Send another reset link" onPress={() => setSent(false)} secondary />
      ) : (
        <>
          <AuthField
            label="Email"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setError('');
            }}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="done"
            textContentType="emailAddress"
            placeholder="you@example.com"
          />
          <AuthButton title="Send reset link" onPress={() => void submit()} loading={busy} />
        </>
      )}
      <AuthTextLink label="Return to sign in" onPress={() => router.replace('/sign-in')} />
    </AuthLayout>
  );
}

export function ResetPasswordScreen() {
  const params = useLocalSearchParams<{
    code?: string | string[];
    error?: string | string[];
    token_hash?: string | string[];
    type?: string | string[];
  }>();
  const code = firstParam(params.code);
  const tokenHash = firstParam(params.token_hash);
  const otpType = firstParam(params.type);
  const providerError = firstParam(params.error);
  const linkingUrl = Linking.useURL();
  const { isPasswordRecovery, signOut } = useAuth();
  const processedLink = useRef('');
  const [checkingLink, setCheckingLink] = useState(Boolean(code || tokenHash || providerError));
  const [recoveryTokenAccepted, setRecoveryTokenAccepted] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code && !tokenHash && !providerError) {
      return;
    }
    const id = `${code ?? ''}:${tokenHash ?? ''}:${otpType ?? ''}:${providerError ?? ''}`;
    if (processedLink.current === id) {
      return;
    }
    processedLink.current = id;
    setCheckingLink(true);
    setLinkError('');
    if (providerError) {
      void Promise.resolve().then(() => {
        setLinkError('This password reset link has expired or is invalid. Request a new one.');
        setCheckingLink(false);
      });
      return;
    }
    const callbackUrl = linkingUrl ??
      `${authRedirectUrl('auth/reset-password')}?${code
        ? `code=${encodeURIComponent(code)}`
        : `token_hash=${encodeURIComponent(tokenHash ?? '')}&type=${encodeURIComponent(otpType ?? '')}`}`;
    void handleAuthRedirect(callbackUrl)
      .then(() => {
        if (otpType === 'recovery' && tokenHash) {
          setRecoveryTokenAccepted(true);
        }
      })
      .catch((cause: unknown) => setLinkError(authErrorMessage(cause)))
      .finally(() => setCheckingLink(false));
  }, [code, linkingUrl, otpType, providerError, tokenHash]);

  const recoveryIsValid = isPasswordRecovery || recoveryTokenAccepted;
  const submit = async () => {
    if (busy || !recoveryIsValid) {
      return;
    }
    if (password.length < 8) {
      setError('Your password must be at least 8 characters.');
      return;
    }
    if (password !== confirmation) {
      setError('The passwords don’t match.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { error: updateError } = await getSupabase().auth.updateUser({ password });
      if (updateError) {
        throw updateError;
      }
      setSuccess(true);
      try {
        await signOut();
      } catch {
        setError('Your password was updated, but this session could not be closed. Try returning to sign in again.');
        return;
      }
      router.replace('/sign-in');
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const returnToSignIn = async () => {
    if (recoveryIsValid) {
      try {
        await signOut();
      } catch (cause) {
        setError(authErrorMessage(cause));
        return;
      }
    }
    router.replace('/sign-in');
  };

  if (checkingLink) {
    return (
      <AuthLayout
        eyebrow="ACCOUNT RECOVERY"
        title="Checking your\nlink."
        description="We’re securely validating your password reset link.">
        <AuthNotice>Keep this screen open while the link is checked.</AuthNotice>
      </AuthLayout>
    );
  }

  if (!recoveryIsValid) {
    return (
      <AuthLayout
        eyebrow="ACCOUNT RECOVERY"
        title="Request a new\nreset link."
        description={linkError || 'This reset session is no longer valid. Request a fresh link to continue.'}>
        <AuthError>{linkError}</AuthError>
        <AuthButton title="Request a reset link" onPress={() => router.replace('/forgot-password')} />
        <AuthTextLink label="Return to sign in" onPress={() => router.replace('/sign-in')} />
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout
        eyebrow="PASSWORD UPDATED"
        title="You’re all\nset."
        description="Your password has been changed. You can now sign in with your new password.">
        <AuthError>{error}</AuthError>
        {!error ? <AuthNotice>Password updated successfully.</AuthNotice> : null}
        <AuthButton title="Continue to sign in" onPress={() => void returnToSignIn()} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="ACCOUNT RECOVERY"
      title="Choose a new\npassword."
      description="Use a password you haven’t used for Twin before.">
      <AuthError>{error}</AuthError>
      <AuthField
        label="New password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setError('');
        }}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        placeholder="At least 8 characters"
        secure
      />
      <PasswordGuidance />
      <AuthField
        label="Confirm new password"
        value={confirmation}
        onChangeText={(value) => {
          setConfirmation(value);
          setError('');
        }}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        placeholder="Enter your new password again"
        secure
      />
      <AuthButton title="Update password" onPress={() => void submit()} loading={busy} />
      <AuthTextLink label="Return to sign in" onPress={() => void returnToSignIn()} />
    </AuthLayout>
  );
}

export function AuthCallbackScreen() {
  const params = useLocalSearchParams<{
    code?: string | string[];
    error?: string | string[];
    token_hash?: string | string[];
    type?: string | string[];
  }>();
  const code = firstParam(params.code);
  const tokenHash = firstParam(params.token_hash);
  const otpType = firstParam(params.type);
  const providerError = firstParam(params.error);
  const linkingUrl = Linking.useURL();
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const processedLink = useRef('');

  useEffect(() => {
    const id = `${code ?? ''}:${tokenHash ?? ''}:${otpType ?? ''}:${providerError ?? ''}`;
    if (processedLink.current === id) {
      return;
    }
    processedLink.current = id;
    if (providerError || (!code && !tokenHash)) {
      void Promise.resolve().then(() => {
        setError('This verification link is invalid or has expired. Request a fresh link and try again.');
        setBusy(false);
      });
      return;
    }
    const callbackUrl = linkingUrl ??
      `${authRedirectUrl('auth/callback')}?${code
        ? `code=${encodeURIComponent(code)}`
        : `token_hash=${encodeURIComponent(tokenHash ?? '')}&type=${encodeURIComponent(otpType ?? '')}`}`;
    void handleAuthRedirect(callbackUrl)
      .then(() => router.replace('/(tabs)/discover'))
      .catch((cause: unknown) => {
        setError(authErrorMessage(cause));
        setBusy(false);
      });
  }, [code, linkingUrl, otpType, providerError, tokenHash]);

  return (
    <AuthLayout
      eyebrow="TWIN ACCOUNT"
      title={busy ? 'Finishing your\nsign-in.' : 'Link could not\nbe verified.'}
      description={busy
        ? 'We’re checking the secure link and restoring your session.'
        : 'Request a fresh verification email, or return to sign in.'}>
      {busy ? <AuthNotice>Almost there.</AuthNotice> : <AuthError>{error}</AuthError>}
      {!busy ? (
        <View>
          <AuthButton title="Return to sign in" onPress={() => router.replace('/sign-in')} />
        </View>
      ) : null}
    </AuthLayout>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
