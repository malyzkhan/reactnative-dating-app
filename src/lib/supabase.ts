import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SECURE_STORE_CHUNK_BYTES = 1700;
const secureStorage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
    }

    const countValue = await SecureStore.getItemAsync(`${key}.count`);
    if (countValue === null) {
      return null;
    }
    const count = Number.parseInt(countValue, 10);
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new Error('Stored authentication data is invalid.');
    }

    const chunks = await Promise.all(
      Array.from({ length: count }, (_, index) =>
        SecureStore.getItemAsync(`${key}.part.${index}`),
      ),
    );
    if (chunks.some((chunk) => chunk === null)) {
      throw new Error('Stored authentication data is incomplete.');
    }
    return chunks.join('');
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') {
        throw new Error('Browser storage is unavailable.');
      }
      window.localStorage.setItem(key, value);
      return;
    }

    const chunks = splitForSecureStore(value);
    const previousCount = Number.parseInt(
      (await SecureStore.getItemAsync(`${key}.count`)) ?? '0',
      10,
    );
    await Promise.all(
      chunks.map((chunk, index) => SecureStore.setItemAsync(`${key}.part.${index}`, chunk)),
    );
    await SecureStore.setItemAsync(`${key}.count`, String(chunks.length));
    if (Number.isSafeInteger(previousCount) && previousCount > chunks.length) {
      await Promise.all(
        Array.from({ length: previousCount - chunks.length }, (_, index) =>
          SecureStore.deleteItemAsync(`${key}.part.${chunks.length + index}`),
        ),
      );
    }
  },
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') {
        return;
      }
      window.localStorage.removeItem(key);
      return;
    }

    const count = Number.parseInt((await SecureStore.getItemAsync(`${key}.count`)) ?? '0', 10);
    await SecureStore.deleteItemAsync(`${key}.count`);
    if (Number.isSafeInteger(count) && count > 0) {
      await Promise.all(
        Array.from({ length: count }, (_, index) =>
          SecureStore.deleteItemAsync(`${key}.part.${index}`),
        ),
      );
    }
  },
};

function splitForSecureStore(value: string) {
  const chunks: string[] = [];
  let chunk = '';
  let chunkBytes = 0;

  for (const character of value) {
    const characterBytes = encodeURIComponent(character).replace(/%[0-9A-F]{2}/gi, 'x').length;
    if (chunkBytes + characterBytes > SECURE_STORE_CHUNK_BYTES) {
      chunks.push(chunk);
      chunk = '';
      chunkBytes = 0;
    }
    chunk += character;
    chunkBytes += characterBytes;
  }
  if (chunk.length > 0 || chunks.length === 0) {
    chunks.push(chunk);
  }
  return chunks;
}

export class SupabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseConfigurationError';
  }
}

let supabase: SupabaseClient | null = null;

export function getSupabase() {
  if (supabase) {
    return supabase;
  }

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !publishableKey) {
    throw new SupabaseConfigurationError(
      'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the project-root .env file, then restart Expo.',
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new SupabaseConfigurationError('EXPO_PUBLIC_SUPABASE_URL must be a valid URL.');
  }
  const isLocalHttp =
    parsedUrl.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsedUrl.hostname);
  if (parsedUrl.protocol !== 'https:' && !isLocalHttp) {
    throw new SupabaseConfigurationError('The Supabase project URL must use HTTPS.');
  }
  if (/service[_-]?role|sb_secret_/i.test(publishableKey)) {
    throw new SupabaseConfigurationError(
      'A Supabase secret/service-role key cannot be used in the mobile app. Use the project publishable key.',
    );
  }
  if (!publishableKey.startsWith('sb_publishable_')) {
    throw new SupabaseConfigurationError(
      'Use the Supabase project publishable key (starting with sb_publishable_) in the mobile app.',
    );
  }

  supabase = createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
      persistSession: true,
      storage: secureStorage,
    },
  });
  return supabase;
}
