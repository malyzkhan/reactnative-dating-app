import React, { type ReactNode } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  type TextProps,
  TouchableOpacity,
  type ViewProps,
  View,
} from 'react-native';

import { Colors } from '@/constants/theme';

export type AppTextTone = 'primary' | 'secondary' | 'muted' | 'brand' | 'success' | 'warning' | 'error';
export type AppTextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'button';

const textColors: Record<AppTextTone, string> = {
  primary: Colors.light.textPrimary,
  secondary: Colors.light.textSecondary,
  muted: Colors.light.textMuted,
  brand: Colors.light.primary,
  success: Colors.light.success,
  warning: Colors.light.warning,
  error: Colors.light.error,
};

const textStyles = StyleSheet.create({
  display: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -1.1,
  },
  h1: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.7,
  },
  h2: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.6,
  },
  h3: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 21,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  bodyStrong: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  label: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    lineHeight: 18,
  },
});

export function AppText({
  variant = 'body',
  tone = 'primary',
  style,
  children,
  ...props
}: TextProps & { variant?: AppTextVariant; tone?: AppTextTone }) {
  return (
    <Text
      {...props}
      style={[
        { color: textColors[tone] },
        textStyles[variant],
        style,
      ]}>
      {children}
    </Text>
  );
}

type AppButtonVariant = 'primary' | 'secondary' | 'ghost';

type AppButtonProps = {
  label: string;
  variant?: AppButtonVariant;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewProps['style'];
};

export function AppButton({ label, variant = 'primary', disabled, onPress, style }: AppButtonProps) {
  const variantStyles = {
    primary: {
      backgroundColor: Colors.light.primary,
      borderColor: Colors.light.primary,
      textColor: '#fffdfb',
    },
    secondary: {
      backgroundColor: Colors.light.surfaceMuted,
      borderColor: Colors.light.border,
      textColor: Colors.light.textPrimary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: Colors.light.border,
      textColor: Colors.light.textPrimary,
    },
  };

  const colors = variantStyles[variant];

  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? Colors.light.disabled : colors.backgroundColor,
          borderColor: disabled ? Colors.light.disabled : colors.borderColor,
        },
        style,
      ]}>
      <AppText variant="button" tone={disabled ? 'muted' : 'primary'} style={{ color: colors.textColor }}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

type AppInputProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  style?: ViewProps['style'];
};

export function AppInput({ label, placeholder, value, onChangeText, secureTextEntry, style }: AppInputProps) {
  return (
    <View style={[styles.inputWrap, style]}>
      {label ? (
        <AppText variant="label" tone="secondary" style={styles.inputLabel}>
          {label}
        </AppText>
      ) : null}
      <TextInput
        value={value}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        onChangeText={onChangeText}
        placeholderTextColor={Colors.light.textMuted}
        style={styles.input}
      />
    </View>
  );
}

export function Avatar({
  size = 44,
  source,
  fallback,
}: {
  size?: number;
  source?: { uri: string };
  fallback?: string;
}) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }] }>
      {source ? (
        <Image source={source} style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]} />
      ) : (
        <AppText variant="h3" tone="primary" style={{ fontSize: size * 0.32, lineHeight: size * 0.4 }}>
          {fallback?.slice(0, 1) ?? 'A'}
        </AppText>
      )}
    </View>
  );
}

export function Divider({ style }: { style?: ViewProps['style'] }) {
  return <View style={[styles.divider, style]} />;
}

export function InterestChip({
  label,
  selected = false,
}: {
  label: string;
  selected?: boolean;
}) {
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: selected ? Colors.light.primary : Colors.light.surfaceMuted,
          borderColor: selected ? Colors.light.primary : Colors.light.border,
        },
      ]}>
      <AppText
        variant="caption"
        tone={selected ? 'primary' : 'secondary'}
        style={{ color: selected ? '#fffdfb' : Colors.light.textPrimary }}>
        {label}
      </AppText>
    </View>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      {eyebrow ? (
        <AppText variant="label" tone="secondary" style={styles.eyebrow}>
          {eyebrow}
        </AppText>
      ) : null}
      <AppText variant="h3" tone="primary">
        {title}
      </AppText>
      {children}
    </View>
  );
}

export function ProfileCard({
  image,
  name,
  age,
  subtitle,
  accent,
}: {
  image: { uri: string };
  name: string;
  age: number;
  subtitle: string;
  accent?: string;
}) {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeaderRow}>
          <AppText variant="h3" tone="primary">
            {name}, {age}
          </AppText>
          <View style={[styles.statusDot, { backgroundColor: accent ?? Colors.light.success }]} />
        </View>
        <AppText variant="body" tone="secondary">
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  inputWrap: {
    gap: 8,
  },
  inputLabel: {
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: Colors.light.textPrimary,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surfaceMuted,
    overflow: 'hidden',
  },
  avatarImage: {
    resizeMode: 'cover',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    width: '100%',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  sectionHeader: {
    gap: 6,
  },
  eyebrow: {
    letterSpacing: 1.2,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 14,
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
});
