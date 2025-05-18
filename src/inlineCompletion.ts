import * as vscode from 'vscode';
import { getOutputChannel } from './output';

const outputChannel = getOutputChannel();


export class GigaChatInlineProvider implements vscode.InlineCompletionItemProvider {
  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionList> {
      vscode.window.showInformationMessage('🧠 InlineCompletion triggered!');
      const outputChannel = getOutputChannel();

    const linePrefix = document.lineAt(position).text.substring(0, position.character);
    outputChannel.appendLine(`[Trigger] User typing at line: "${linePrefix}"`);


    if (!linePrefix.trim()) {
      outputChannel.appendLine(`[Skip] Empty or whitespace input`);
      return { items: [] };
    }

    try {
      const suggestion = await fetchGigaChatSuggestion(linePrefix);

      if (!suggestion) {
        outputChannel.appendLine(`[Empty] No suggestion returned`);
        return { items: [] };
      }

      outputChannel.appendLine(`[Suggest] "${suggestion}"`);

      return {
        items: [
          new vscode.InlineCompletionItem(
            suggestion,
            new vscode.Range(position, position)
          )
        ]
      };
    } catch (error) {
      outputChannel.appendLine(`[Error] ${error instanceof Error ? error.message : String(error)}`);
      return { items: [] };
    }
  }
}

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
