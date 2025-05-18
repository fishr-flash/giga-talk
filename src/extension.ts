import * as vscode from 'vscode';

let debounceTimer: NodeJS.Timeout | undefined;

import { gigaChainInlineCompletion } from './gigaChainInlineCompletion';
import { getOutputChannel } from './output';

import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

export function activate(context: vscode.ExtensionContext) {
  // показать Output канал при запуске
  const outputChannel = getOutputChannel();
  
  
  outputChannel.show(true); // Открыть автоматически
  outputChannel.appendLine("🚀 GigaChat Extension Activated");
  outputChannel.appendLine(`process.env.LANG_API_URL: ${process.env.LANG_API_URL}`);
  outputChannel.appendLine(`__dirname ${__dirname}`);

  context.subscriptions.push(
    vscode.languages.registerInlineCompletionItemProvider(
      "*", // или ограничить на js/ts
      new gigaChainInlineCompletion()
    )
  );
  
}

export function deactivate() {}
