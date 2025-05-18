import * as vscode from 'vscode';
import { fetchGigaChatSuggestion } from './fetchGigaChatSuggestion';
import { getOutputChannel } from './output';

const outputChannel = getOutputChannel();

// Для отслеживания таймеров по документу
const debounceTimers = new Map<string, NodeJS.Timeout>();

export class gigaChainInlineCompletion implements vscode.InlineCompletionItemProvider {
  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _context: vscode.InlineCompletionContext,
    _token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionList> {
    const linePrefix = document.lineAt(position).text.substring(0, position.character);
    const uriKey = document.uri.toString();
    outputChannel.appendLine(`[Trigger] User typing at line: "${linePrefix}"`);

    if (!linePrefix.trim()) {
      outputChannel.appendLine(`[Skip] Empty or whitespace input`);
      return { items: [] };
    }

    // Очищаем предыдущий таймер, если есть
    if (debounceTimers.has(uriKey)) {
      clearTimeout(debounceTimers.get(uriKey));
    }

    return await new Promise((resolve) => {
      const timer = setTimeout(async () => {
        // Проверим, что активный документ тот же
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || activeEditor.document.uri.toString() !== uriKey) {
          outputChannel.appendLine(`[Cancel] Editor context changed, skipping suggestion`);
          resolve({ items: [] });
          return;
        }

        try {
          vscode.window.showInformationMessage('🧠 InlineCompletion triggered after delay');
          const suggestion = await fetchGigaChatSuggestion(linePrefix);

          if (!suggestion) {
            outputChannel.appendLine(`[Empty] No suggestion returned`);
            resolve({ items: [] });
            return;
          }

          outputChannel.appendLine(`[Suggest] "${suggestion}"`);

          resolve({
            items: [
              new vscode.InlineCompletionItem(
                suggestion,
                new vscode.Range(position, position)
              )
            ]
          });
        } catch (error) {
          outputChannel.appendLine(`[Error] ${error instanceof Error ? error.message : String(error)}`);
          resolve({ items: [] });
        }
      }, 1500);

      debounceTimers.set(uriKey, timer);
    });
  }
}
