import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
	console.log('ContextClip is now active!');
  let disposable = vscode.commands.registerCommand(
    "contextclip.copyOpenEditors",
    () => {
      // For now, just show a notification to confirm it works
      vscode.window.showInformationMessage("ContextClip: Command executed!");
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
