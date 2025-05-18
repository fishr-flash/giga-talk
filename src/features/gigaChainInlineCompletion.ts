import * as vscode from 'vscode';
import { getOutputChannel } from '../core/output';
import { fetchGigaChainSuggestion } from './fetchGigaChainSuggestion';

const outputChannel = getOutputChannel();

// Глобальный таймер и строка
let debounceTimer: NodeJS.Timeout | undefined;
let lastLinePrefix: string | undefined;
let lastDocumentUri: string | undefined;

// Отслеживаем смену активного документа
vscode.window.onDidChangeActiveTextEditor((editor) => {
  if (debounceTimer && editor?.document.uri.toString() !== lastDocumentUri) {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
    outputChannel.appendLine(`[Info] Editor changed — timer cancelled`);
  }
});

export class gigaChainInlineCompletion implements vscode.InlineCompletionItemProvider {
  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _context: vscode.InlineCompletionContext,
    _token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionList> {
    const linePrefix = document.lineAt(position).text.substring(0, position.character);
    outputChannel.appendLine(`[Trigger] User typing at line: "${linePrefix}"`);

    if (!linePrefix.trim()) {
      outputChannel.appendLine(`[Skip] Empty or whitespace input`);
      return { items: [] };
    }

    if (linePrefix === lastLinePrefix) {
      outputChannel.appendLine(`[Skip] Line prefix unchanged since last request`);
      return { items: [] };
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    return await new Promise((resolve) => {
      lastDocumentUri = document.uri.toString();

      debounceTimer = setTimeout(async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || activeEditor.document !== document) {
          outputChannel.appendLine(`[Cancel] Editor context changed, skipping suggestion`);
          resolve({ items: [] });
          return;
        }

        try {
          vscode.window.showInformationMessage('🧠 InlineCompletion triggered after delay');
          const suggestion = await fetchGigaChainSuggestion(linePrefix);

          if (!suggestion) {
            outputChannel.appendLine(`[Empty] No suggestion returned`);
            resolve({ items: [] });
            return;
          }

          outputChannel.appendLine(`[Suggest] "${suggestion}"`);
          lastLinePrefix = linePrefix;

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
        } finally {
          debounceTimer = undefined;
        }
      }, 1500);
    });
  }
}
