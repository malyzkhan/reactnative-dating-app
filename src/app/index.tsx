import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Colors } from '@/constants/theme';
import { setIntroCompleted, getIntroCompleted } from '@/lib/intro-storage';

const steps = [
  {
    eyebrow: 'A MORE THOUGHTFUL WAY TO MEET',
    title: 'Meet beyond\nthe profile.',
    description: 'Discover people through their interests, intentions, and personalities.',
  },
  {
    eyebrow: 'WHAT MATTERS, MATTERS',
    title: 'Make room\nfor connection.',
    description: 'Find people who share what matters to you.',
  },
  {
    eyebrow: 'START WITH CURIOSITY',
    title: 'Start with a\nconversation.',
    description: 'A good connection begins with curiosity.',
  },
];

type IntroStatus = 'checking' | 'showing' | 'redirecting' | 'error';

export default function IntroScreen() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<IntroStatus>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const currentStep = steps[step];

  useEffect(() => {
    let active = true;

    getIntroCompleted()
      .then((completed) => {
        if (active) {
          setStatus(completed ? 'redirecting' : 'showing');
        }
      })
      .catch((error: unknown) => {
        console.error('Unable to read Twin intro status.', error);
        if (active) {
          setErrorMessage('We couldn’t load your saved welcome status. Please try again.');
          setStatus('error');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (status === 'redirecting') {
      router.replace('/sign-in');
    }
  }, [status]);

  const retryReadStatus = async () => {
    setStatus('checking');
    setErrorMessage('');
    try {
      const completed = await getIntroCompleted();
      setStatus(completed ? 'redirecting' : 'showing');
    } catch (error) {
      console.error('Unable to read Twin intro status.', error);
      setErrorMessage('We couldn’t load your saved welcome status. Please try again.');
      setStatus('error');
    }
  };

  const enterAuth = async (destination: '/sign-up' | '/sign-in') => {
    if (saving) {
      return;
    }

    setSaving(true);
    setErrorMessage('');
    try {
      await setIntroCompleted(true);
      router.replace(destination);
    } catch (error) {
      console.error('Unable to save Twin intro status.', error);
      setSaving(false);
      setErrorMessage('Your welcome progress could not be saved. Please try again.');
    }
  };

  if (status === 'checking' || status === 'redirecting') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorState}>
          <Text style={styles.wordmark}>twin.</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable accessibilityRole="button" onPress={retryReadStatus} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.topRow}>
          <Text style={styles.wordmark}>twin.</Text>
          {step < steps.length - 1 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setStep(steps.length - 1)}
              hitSlop={10}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          ) : (
            <Text style={styles.topNote}>MEET WITH INTENTION</Text>
          )}
        </View>

        <View style={styles.editorialMark}>
          <View style={styles.markLine} />
          <View style={styles.markCircle} />
          <View style={styles.markLine} />
        </View>

        <View style={styles.copyBlock}>
          <Text style={styles.eyebrow}>{currentStep.eyebrow}</Text>
          <Text accessibilityRole="header" style={styles.heading}>
            {currentStep.title}
          </Text>
          <Text style={styles.description}>{currentStep.description}</Text>
        </View>

        <View style={styles.bottomBlock}>
          <View
            accessibilityLabel={`Introduction screen ${step + 1} of ${steps.length}`}
            style={styles.pagination}>
            {steps.map((item, index) => (
              <View
                key={item.eyebrow}
                style={[styles.paginationDot, index === step && styles.paginationDotActive]}
              />
            ))}
          </View>

          {errorMessage ? <Text style={styles.inlineError}>{errorMessage}</Text> : null}

          {step < steps.length - 1 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setStep((current) => Math.min(current + 1, steps.length - 1))}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryButtonText}>Continue</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                disabled={saving}
                onPress={() => enterAuth('/sign-up')}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                  saving && styles.buttonDisabled,
                ]}>
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create account</Text>
                )}
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={saving}
                onPress={() => enterAuth('/sign-in')}
                style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>I already have an account</Text>
              </Pressable>
              <Text style={styles.disclaimer}>
                This introduction doesn’t create or sign you into an account.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setStep((current) => Math.max(0, current - 1))}
                style={styles.backButton}>
                <Text style={styles.backText}>← Back</Text>
              </Pressable>
            </>
          )}

          {step < steps.length - 1 && step > 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setStep((current) => Math.max(0, current - 1))}
              style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 43,
  },
  wordmark: {
    color: Colors.light.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 29,
    lineHeight: 36,
    letterSpacing: -1.6,
  },
  skipText: {
    color: Colors.light.textSecondary,
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
  },
  topNote: {
    color: Colors.light.textMuted,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 9,
    letterSpacing: 1.1,
  },
  editorialMark: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 150,
    marginTop: 48,
    marginBottom: 36,
  },
  markLine: {
    height: 1,
    flex: 1,
    backgroundColor: Colors.light.border,
  },
  markCircle: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  copyBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  eyebrow: {
    color: Colors.light.primary,
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.4,
    marginBottom: 13,
  },
  heading: {
    color: Colors.light.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  description: {
    color: Colors.light.textSecondary,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 25,
    maxWidth: 330,
    marginTop: 17,
  },
  bottomBlock: {
    paddingBottom: 8,
  },
  pagination: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 19,
  },
  paginationDot: {
    height: 4,
    width: 19,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
  },
  paginationDotActive: {
    width: 32,
    backgroundColor: Colors.light.primary,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 12,
    paddingHorizontal: 17,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButtonText: {
    color: '#FFFDFA',
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
  },
  buttonArrow: {
    color: '#FFFDFA',
    fontSize: 18,
    position: 'absolute',
    right: 18,
  },
  secondaryButton: {
    minHeight: 47,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  secondaryButtonText: {
    color: Colors.light.textPrimary,
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
  },
  disclaimer: {
    color: Colors.light.textMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 4,
  },
  backButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  backText: {
    color: Colors.light.textSecondary,
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  inlineError: {
    color: Colors.light.error,
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.85,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorState: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 18,
  },
  errorText: {
    color: Colors.light.textSecondary,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 23,
  },
});
