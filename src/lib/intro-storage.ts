import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const INTRO_COMPLETED_KEY = 'twin.intro.completed';

export async function getIntroCompleted() {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(INTRO_COMPLETED_KEY) === 'true';
  }

  return (await SecureStore.getItemAsync(INTRO_COMPLETED_KEY)) === 'true';
}

export async function setIntroCompleted(completed: boolean) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') {
      throw new Error('Browser storage is unavailable.');
    }

    if (completed) {
      window.localStorage.setItem(INTRO_COMPLETED_KEY, 'true');
    } else {
      window.localStorage.removeItem(INTRO_COMPLETED_KEY);
    }
    return;
  }

  if (completed) {
    await SecureStore.setItemAsync(INTRO_COMPLETED_KEY, 'true');
  } else {
    await SecureStore.deleteItemAsync(INTRO_COMPLETED_KEY);
  }
}
