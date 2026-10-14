import { useState, type PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

const colors = Colors.light;

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
}: PropsWithChildren<{ eyebrow: string; title: string; description: string }>) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.wordmark}>twin.</Text>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text accessibilityRole="header" style={styles.heading}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            <View style={styles.form}>{children}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthField({
  label,
  error,
  secure = false,
  ...inputProps
}: TextInputProps & { label: string; error?: string; secure?: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, error ? styles.inputError : null]}>
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          autoCorrect={false}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secure && !visible}
          style={styles.input}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            accessibilityState={{ selected: visible }}
            hitSlop={10}
            onPress={() => setVisible((current) => !current)}
            style={styles.visibilityButton}>
            <Text style={styles.visibilityText}>{visible ? 'Hide' : 'Show'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function AuthButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  secondary?: boolean;
}) {
  const unavailable = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: unavailable, busy: loading }}
      disabled={unavailable}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary ? styles.secondaryButton : styles.primaryButton,
        unavailable && styles.disabledButton,
        pressed && !unavailable && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={secondary ? colors.primary : colors.surface} />
      ) : (
        <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function AuthGoogleButton({
  onPress,
  loading,
}: {
  onPress: () => void;
  loading: boolean;
}) {
  return (
    <AuthButton title="Continue with Google" onPress={onPress} loading={loading} secondary />
  );
}

export function AuthError({ children }: PropsWithChildren) {
  if (!children) {
    return null;
  }
  return <Text accessibilityRole="alert" style={styles.errorMessage}>{children}</Text>;
}

export function AuthNotice({ children }: PropsWithChildren) {
  if (!children) {
    return null;
  }
  return <Text accessibilityRole="summary" style={styles.noticeMessage}>{children}</Text>;
}

export function AuthTextLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} style={styles.textLink}>
      <Text style={styles.textLinkLabel}>{label}</Text>
    </Pressable>
  );
}

export function AuthDivider() {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.divider} />
      <Text style={styles.dividerLabel}>OR</Text>
      <View style={styles.divider} />
    </View>
  );
}

export function PasswordGuidance() {
  return (
    <Text style={styles.passwordGuidance}>
      Use at least 8 characters. Your Supabase project may require additional rules.
    </Text>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  content: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 25,
    paddingTop: 22,
    paddingBottom: 32,
  },
  wordmark: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 29,
    letterSpacing: -1.5,
    marginBottom: 42,
  },
  eyebrow: {
    color: colors.primary,
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.25,
    marginBottom: 11,
  },
  heading: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 39,
    lineHeight: 47,
    letterSpacing: -0.8,
  },
  description: {
    color: colors.textSecondary,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  form: { marginTop: 28, gap: 15 },
  field: { gap: 7 },
  fieldLabel: {
    color: colors.textSecondary,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
  },
  inputWrap: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.error },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
  },
  visibilityButton: {
    minHeight: 48,
    minWidth: 55,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  visibilityText: {
    color: colors.primary,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
  },
  fieldError: {
    color: colors.error,
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
  },
  button: {
    width: '100%',
    minHeight: 52,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  primaryButton: { backgroundColor: colors.primary },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  disabledButton: { opacity: 0.58 },
  pressed: { opacity: 0.86 },
  buttonText: {
    color: colors.surface,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
  },
  secondaryButtonText: { color: colors.textPrimary },
  textLink: { minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  textLinkLabel: {
    color: colors.primary,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    textAlign: 'center',
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 1 },
  divider: { height: StyleSheet.hairlineWidth, flex: 1, backgroundColor: colors.border },
  dividerLabel: {
    color: colors.textMuted,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 9,
    letterSpacing: 1,
  },
  errorMessage: {
    color: colors.error,
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    lineHeight: 18,
  },
  noticeMessage: {
    color: colors.success,
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    lineHeight: 18,
  },
  passwordGuidance: {
    color: colors.textMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    lineHeight: 16,
    marginTop: -8,
  },
});
