import { BiologyTerm } from '../types/biology';

/**
 * Pronounces an English biology term using the browser's Web Speech API SpeechSynthesis.
 * Prioritizes en-US voices.
 */
export function speakEnglishTerm(term: string): boolean {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(term);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for clear educational pronunciation
    utterance.pitch = 1.0;

    // Pick en-US voice if available
    const voices = window.speechSynthesis.getVoices();
    const usVoice = voices.find((v) => v.lang.startsWith('en-US') || v.lang.startsWith('en_US'));
    if (usVoice) {
      utterance.voice = usVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Failed to speak term:', err);
    return false;
  }
}

/**
 * Calls server-side Gemini API with query and contextTerm from standard database.
 */
export async function askBiologyAssistant(
  message: string,
  contextTerm?: BiologyTerm
): Promise<{ text?: string; error?: string }> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        contextTerm,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMsg =
        errorData?.error ||
        'Hệ thống AI đang tạm thời không phản hồi. Bạn vẫn có thể tra cứu dữ liệu Sinh học chuẩn.';
      return { error: errorMsg };
    }

    const data = await response.json();
    return { text: data.text };
  } catch (err: any) {
    console.error('Error contacting AI assistant:', err);
    return {
      error: 'Hệ thống AI đang tạm thời không phản hồi. Bạn vẫn có thể tra cứu dữ liệu Sinh học chuẩn.',
    };
  }
}