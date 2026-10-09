import { GoogleGenAI } from '@google/genai';

export async function runModelPrompt({ system, user }) {
  const provider = process.env.MODEL_PROVIDER ?? 'google-gemma';
  const model = process.env.MODEL_NAME ?? 'gemma-4-26b-a4b-it';
  const apiKey = process.env.GEMINI_API_KEY;

  if (provider === 'google-gemma' || provider === 'gemini' || provider === 'google') {
    if (!apiKey || apiKey.trim() === '') {
      return {
        provider,
        model,
        status: 'not-configured',
        message: 'GEMINI_API_KEY is not set in server/.env.',
        system,
        user
      };
    }

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      const response = await ai.models.generateContent({
        model,
        contents: user,
        config: {
          systemInstruction: system,
          temperature: 0.1
        }
      });

      const output = response?.text ?? '';
      return {
        provider,
        model,
        status: 'connected',
        output,
        system,
        user
      };
    } catch (err) {
      // Sanitize error message to prevent leaking sensitive credentials
      const safeMessage = (err?.message ?? 'Model call failed').replace(/key=[^&\s]+/gi, 'key=[REDACTED]');
      return {
        provider,
        model,
        status: 'error',
        message: safeMessage,
        system,
        user
      };
    }
  }

  // Fallback for local open-weight endpoints
  const endpoint = process.env.MODEL_ENDPOINT;
  if (!endpoint) {
    return {
      provider,
      model,
      status: 'not-configured',
      message: 'Set MODEL_ENDPOINT and MODEL_NAME to connect an open-weight model provider.',
      system,
      user
    };
  }

  return {
    provider,
    model,
    status: 'not-called',
    message: 'Provider adapter is intentionally pending; add an HTTP adapter once a local/open-weight endpoint is chosen.'
  };
}
