import type { DesignTokens } from '../utils/designTokens';

/* The server's message is written for visitors, so it can be shown as is */
export class StyleApiError extends Error {}

/* Asks the backend (server/, POST /api/styles) to turn a request into a style */
export async function requestStyle(prompt: string): Promise<DesignTokens> {
  let response: Response;
  try {
    response = await fetch('/api/styles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
  } catch {
    throw new StyleApiError('Couldn’t reach the server.');
  }

  const data = (await response.json().catch(() => null)) as { style?: DesignTokens; error?: string } | null;
  if (!response.ok || !data?.style) {
    throw new StyleApiError(data?.error ?? 'The server couldn’t make a style.');
  }
  // The server checked the shape; buildTheme still checks every colour and fixes contrast
  return data.style;
}
