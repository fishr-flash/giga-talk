import { getOutputChannel } from "./output";

const outputChannel = getOutputChannel();

async function fetchGigaChatSuggestion(prefix: string): Promise<string | null> {

    const fakeSuggestion = `✨ Продолжение для: "${prefix}"`;
  outputChannel.appendLine(`[Mock] Returning fake suggestion: "${fakeSuggestion}"`);
    return fakeSuggestion;
    // Убрать комментарий ниже, чтобы использовать реальный API
  const apiUrl = 'https://example.com/gigachat'; // заменить на реальный
  const token = 'your-token'; // заменить на реальный или брать из settings

  outputChannel.appendLine(`[API] Fetching suggestion for: "${prefix}"`);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prefix }),
    });

    if (!response.ok) {
      outputChannel.appendLine(`[HTTP ${response.status}] ${response.statusText}`);
      return null;
    }

    type GigaChatResponse = {
      completion?: string;
    };

    const data = await response.json() as GigaChatResponse;

    outputChannel.appendLine(`[API] Response: ${JSON.stringify(data)}`);

    return data.completion || null;
  } catch (err) {
    // outputChannel.appendLine(`[Fetch Error] ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

export { fetchGigaChatSuggestion };
// export default fetchGigaChatSuggestion;