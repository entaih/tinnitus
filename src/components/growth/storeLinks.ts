import Constants from 'expo-constants';

/** Store URLs from app.json `extra.storeUrls` (set once the listings exist — docs/RELEASE.md). Empty = not shown. */
const extra = (Constants.expoConfig?.extra ?? {}) as { storeUrls?: { ios?: string | null; android?: string | null } };
export const STORE_IOS: string = extra.storeUrls?.ios ?? '';
export const STORE_ANDROID: string = extra.storeUrls?.android ?? '';
