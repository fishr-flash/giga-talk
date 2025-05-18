#!/bin/bash

# Название расширения
EXT_NAME="giga-chat-extension"
EXT_ID="giga-chat"
PUBLISHER="your-name"  # замените на своё имя/организацию

# Создание основной структуры
mkdir -p $EXT_NAME/{src,media,out,synthetics}
cd $EXT_NAME

# Инициализация npm
npm init -y

# Установка зависимостей
npm install --save @vscode/webview-ui-toolkit
npm install --save-dev typescript @types/node @types/vscode vscode
npx tsc --init

# Создание файлов

# .vscodeignore
cat <<EOF > .vscodeignore
out/test/**
node_modules/**
.vscode/**
.git/**
EOF

# .gitignore
cat <<EOF > .gitignore
node_modules
out
.vscode
EOF

# tsconfig.json
cat <<EOF > tsconfig.json
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "lib": ["es6"],
    "outDir": "out",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
EOF

# package.json (обновление полей вручную или jq)
npx json -I -f package.json -e "this.main='out/extension.js'"
npx json -I -f package.json -e "this.contributes={\"commands\":[{\"command\":\"$EXT_ID.startSession\",\"title\":\"Start GigaChat Session\"}]}"
npx json -I -f package.json -e "this.activationEvents=[\"onCommand:$EXT_ID.startSession\"]"
npx json -I -f package.json -e "this.publisher=\"$PUBLISHER\""
npx json -I -f package.json -e "this.name=\"$EXT_ID\""
npx json -I -f package.json -e "this.displayName=\"GigaChat Assistant\""
npx json -I -f package.json -e "this.engines={\"vscode\": \"^1.75.0\"}"

# src/extension.ts
cat <<EOF > src/extension.ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('$EXT_ID.startSession', () => {
    const panel = vscode.window.createWebviewPanel(
      'gigaChatPanel',
      'GigaChat',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
      }
    );

    panel.webview.html = getWebviewContent();

    vscode.window.onDidChangeTextEditorSelection((event) => {
      const text = event.textEditor.document.getText(event.selections[0]);
      panel.webview.postMessage({ type: 'selection', text });
    });

    panel.webview.onDidReceiveMessage(message => {
      if (message.type === 'query') {
        vscode.window.showInformationMessage('GigaChat query: ' + message.text);
        // Здесь должна быть отправка запроса в GigaChat API
      }
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}

function getWebviewContent(): string {
  return \`
    <!DOCTYPE html>
    <html lang="en">
    <body>
      <h2>GigaChat Assistant</h2>
      <textarea id="input" rows="5" cols="40" placeholder="Type something..."></textarea>
      <button onclick="send()">Send</button>
      <script>
        const vscode = acquireVsCodeApi();
        function send() {
          const text = document.getElementById('input').value;
          vscode.postMessage({ type: 'query', text });
        }

        window.addEventListener('message', event => {
          const msg = event.data;
          if (msg.type === 'selection') {
            document.getElementById('input').value = msg.text;
          }
        });
      </script>
    </body>
    </html>
  \`;
}
EOF

# Готово
echo "✅ VSCode плагин '$EXT_ID' создан."
