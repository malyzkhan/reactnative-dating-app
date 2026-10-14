import type { Session, User } from '@supabase/supabase-js';
import { ActivityIndicator, AppState, Platform, StyleSheet, Text, View } from 'react-native';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { Colors } from '@/constants/theme';
import { authErrorMessage } from '@/features/auth/auth-errors';
import { getSupabase, SupabaseConfigurationError } from '@/lib/supabase';

type AuthStatus = 'loading' | 'ready' | 'error';
type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  isPasswordRecovery: boolean;
  initializationError: string | null;
  retryInitialization: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);

  useEffect(() => {
    let active = true;
    let authEventCount = 0;
    let unsubscribe: (() => void) | undefined;

    void Promise.resolve().then(async () => {
      const client = getSupabase();
      if (Platform.OS !== 'web') {
        const appStateSubscription = AppState.addEventListener('change', (state) => {
          if (state === 'active') {
            void client.auth.startAutoRefresh();
          } else {
            client.auth.stopAutoRefresh();
          }
        });
        unsubscribe = () => appStateSubscription.remove();
        if (AppState.currentState === 'active') {
          void client.auth.startAutoRefresh();
        } else {
          client.auth.stopAutoRefresh();
        }
      }
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((event, nextSession) => {
        authEventCount += 1;
        if (!active) {
          return;
        }
        setSession(nextSession);
        setStatus('ready');
        setInitializationError(null);
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        } else if (event === 'SIGNED_OUT') {
          setIsPasswordRecovery(false);
        }
      });
      const unsubscribeAppState = unsubscribe;
      unsubscribe = () => {
        subscription.unsubscribe();
        unsubscribeAppState?.();
      };
      const initialEventCount = authEventCount;
      const { data, error } = await client.auth.getSession();
      if (!active || authEventCount !== initialEventCount) {
        return;
      }
      if (error) {
        throw error;
      }
      setSession(data.session);
      setStatus('ready');
    }).catch((error: unknown) => {
      if (!active) {
        return;
      }
      setInitializationError(
        error instanceof SupabaseConfigurationError
          ? error.message
          : authErrorMessage(error),
      );
      setStatus('error');
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [retryVersion]);

  const retryInitialization = useCallback(() => {
    setInitializationError(null);
    setStatus('loading');
    setRetryVersion((version) => version + 1);
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await getSupabase().auth.signOut();
    if (error) {
      throw error;
    }
    setSession(null);
    setIsPasswordRecovery(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      isPasswordRecovery,
      initializationError,
      retryInitialization,
      signOut,
    }),
    [initializationError, isPasswordRecovery, retryInitialization, session, signOut, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}

export function AuthLoadingScreen() {
  return (
    <View style={styles.loading}>
      <Text style={styles.wordmark}>twin.</Text>
      <ActivityIndicator color={Colors.light.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    backgroundColor: Colors.light.background,
  },
  wordmark: {
    color: Colors.light.primary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 30,
    letterSpacing: -1,
  },
});
