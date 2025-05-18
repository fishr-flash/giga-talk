import * as vscode from 'vscode';
import { getOutputChannel } from './output';
import { fetchGigaChatSuggestion } from './fetchGigaChatSuggestion';
import { fetchLocalSuggestion } from './fetchLocalSuggestion';

const outputChannel = getOutputChannel();


export class GigaChatInlineProvider implements vscode.InlineCompletionItemProvider {
  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionList> {
      vscode.window.showInformationMessage('🧠 InlineCompletion triggered!');

    const linePrefix = document.lineAt(position).text.substring(0, position.character);
    outputChannel.appendLine(`[Trigger] User typing at line: "${linePrefix}"`);


    if (!linePrefix.trim()) {
      outputChannel.appendLine(`[Skip] Empty or whitespace input`);
      return { items: [] };
    }

    try {
      const suggestion = await fetchLocalSuggestion(linePrefix);

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