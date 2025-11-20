export async function copyToClipboard(text: string): Promise<void> {
  try {
    // Dynamically require expo-clipboard if available at runtime
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    const Clipboard = require('expo-clipboard');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    if (Clipboard && typeof Clipboard.setStringAsync === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await Clipboard.setStringAsync(text);
      return;
    }
  } catch {
    // expo-clipboard not available; fall back to web clipboard if present
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  }
}


