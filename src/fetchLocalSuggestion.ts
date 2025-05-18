import { getOutputChannel } from "./output";

const outputChannel = getOutputChannel();

async function fetchLocalSuggestion(prompt: string): Promise<string | null> {
  const apiUrl = process.env.LANG_API_URL || '';

    
  outputChannel.appendLine(`[LocalAPI] apiUrl: ${apiUrl}`);
  outputChannel.appendLine(`[LocalAPI] Sending prompt: "${prompt}"`);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: prompt, system: "Это фрагмент кода на typescript. Заверши ввод строки." }),
    });

    if (!response.ok) {
      outputChannel.appendLine(`[HTTP ${response.status}] ${response.statusText}`);
      return null;
    }

    type LocalResponse = {
      response?: string;
    };

    const data = await response.json() as LocalResponse;

    outputChannel.appendLine(`[LocalAPI] Response: ${JSON.stringify(data)}`);

    return data.response || null;
  } catch (err) {
    outputChannel.appendLine(`[LocalAPI Error] ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

export { fetchLocalSuggestion };
