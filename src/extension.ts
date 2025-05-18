import * as vscode from 'vscode';

let debounceTimer: NodeJS.Timeout | undefined;

import { GigaChatInlineProvider } from './inlineCompletion';
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
      new GigaChatInlineProvider()
    )
  );
  const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || event.document !== editor.document) return;

    // Сбросим предыдущий таймер
    if (debounceTimer) clearTimeout(debounceTimer);

    // Запускаем новый таймер (1.5 сек)
    debounceTimer = setTimeout(() => {
      const code = editor.document.getText();
      sendToGigaChat(code);
    }, 3000);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}

function sendToGigaChat(text: string) {
  const apiUrl = 'https://example.com/gigachat'; // ← Здесь будет настоящий endpoint
  const token = 'your-token'; // ← Лучше брать из `settings.json`

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: text,
    }),
  })
    .then(res => res.json())
    .then(data => {
      console.log('✅ GigaChat ответ:', data);
      // Можно: показать результат пользователю, подсказку и т.п.
    })
    .catch(err => {
      console.error('❌ Ошибка при отправке в GigaChat:', err);
    });
}
