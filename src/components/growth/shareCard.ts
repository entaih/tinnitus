import type React from 'react';
import { Share, type View } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

/**
 * Captures the on-screen card (react-native-view-shot, bundled in Expo Go) and hands the PNG to the share sheet.
 * Falls back to the plain-text share when capture or file sharing is unavailable (e.g. web). Resolves `'image'` or
 * `'text'` according to what went out; throws only when the fallback itself fails.
 */
export async function shareCardImage(ref: React.RefObject<React.ComponentRef<typeof View> | null>, opts: { fileName: string; dialogTitle: string; fallbackText: string }): Promise<'image' | 'text'> {
  try {
    const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile', fileName: opts.fileName });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: opts.dialogTitle });
      return 'image';
    }
    await Share.share({ url: uri, message: uri, title: opts.dialogTitle });
    return 'image';
  } catch {
    await Share.share({ message: opts.fallbackText, title: opts.dialogTitle });
    return 'text';
  }
}
