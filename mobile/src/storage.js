// AsyncStorage replaces the web's sessionStorage. Every call is wrapped so a storage
// failure never breaks the demo (the app simply forgets the value).
import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  passport: 'compass-passport', // same key the web app uses in sessionStorage
  apiUrl: 'compass-api-url', // server address chosen in Demo controls
};

export async function getItem(key) {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setItem(key, value) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // ignore: storage is a convenience only
  }
}

export async function removeItem(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}
