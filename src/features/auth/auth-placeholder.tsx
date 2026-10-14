import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Colors } from '@/constants/theme';
import { setIntroCompleted } from '@/lib/intro-storage';

export default function AuthPlaceholder({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [resetting, setResetting] = useState(false);
  const creatingAccount = mode === 'sign-up';

  const returnToIntro = async () => {
    if (resetting) {
      return;
    }

    setResetting(true);
    setErrorMessage('');
    try {
      await setIntroCompleted(false);
      router.replace('/');
    } catch (error) {
      console.error('Unable to reset Twin intro status.', error);
      setErrorMessage('We couldn’t return to the welcome screens. Please try again.');
      setResetting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.wordmark}>twin.</Text>
        <Text style={styles.eyebrow}>YOUR NEXT CHAPTER STARTS HERE</Text>
        <Text accessibilityRole="header" style={styles.heading}>
          {creatingAccount ? 'Create your\naccount.' : 'Welcome\nback.'}
        </Text>
        <Text style={styles.description}>
          {creatingAccount
            ? 'Account creation is the next step in Twin’s development. Your introduction is complete, but no account has been created.'
            : 'Sign-in is the next step in Twin’s development. No authentication has been attempted.'}
        </Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Authentication isn’t connected yet</Text>
          <Text style={styles.infoDescription}>
            Email, phone verification, and account recovery will be implemented with Supabase in a later phase.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          disabled
          style={styles.disabledButton}>
          <Text style={styles.disabledButtonText}>
            {creatingAccount ? 'Sign up unavailable' : 'Sign in unavailable'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace(creatingAccount ? '/sign-in' : '/sign-up')}
          style={styles.alternateButton}>
          <Text style={styles.alternateText}>
            {creatingAccount ? 'I already have an account' : 'Create an account'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={resetting}
          onPress={returnToIntro}
          style={styles.backButton}>
          <Text style={styles.backText}>← Back to Twin introduction</Text>
        </Pressable>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    justifyContent: 'center',
  },
  wordmark: {
    color: Colors.light.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    letterSpacing: -1.5,
    marginBottom: 54,
  },
  eyebrow: {
    color: Colors.light.primary,
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  heading: {
    color: Colors.light.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 42,
    lineHeight: 49,
    letterSpacing: -0.8,
  },
  description: {
    color: Colors.light.textSecondary,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 15,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    borderRadius: 13,
    padding: 14,
    marginTop: 25,
    marginBottom: 17,
  },
  infoTitle: {
    color: Colors.light.textPrimary,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
  },
  infoDescription: {
    color: Colors.light.textSecondary,
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  disabledButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: Colors.light.disabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButtonText: {
    color: Colors.light.surface,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
  },
  alternateButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alternateText: {
    color: Colors.light.primary,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
  },
  backButton: {
    alignItems: 'center',
    minHeight: 43,
    justifyContent: 'center',
  },
  backText: {
    color: Colors.light.textMuted,
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  errorText: {
    color: Colors.light.error,
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
