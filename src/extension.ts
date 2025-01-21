import * as vscode from "vscode";

interface EditorQuickPickItem extends vscode.QuickPickItem {
  uri: vscode.Uri;
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "contextclip.copyOpenEditors",
    async () => {
      // Get all tab groups and their tabs
      const allTabs = vscode.window.tabGroups.all.flatMap(group => 
        group.tabs.filter(tab => tab.input instanceof vscode.TabInputText)
          .map(tab => (tab.input as vscode.TabInputText).uri)
      );
      
      // If no editors are open, show a message and return
      if (allTabs.length === 0) {
        vscode.window.showInformationMessage("No editors are currently open.");
        return;
      }

      // Create QuickPick items from tabs
      const items: EditorQuickPickItem[] = allTabs.map(uri => {
        return {
          label: vscode.workspace.asRelativePath(uri),
          description: uri.fsPath,
          uri: uri
        };
      });

      // Create and show QuickPick
      const quickPick = vscode.window.createQuickPick<EditorQuickPickItem>();
      quickPick.items = items;
      quickPick.placeholder = "Select editors to copy (use space to select multiple)";
      quickPick.canSelectMany = true;

      quickPick.onDidAccept(() => {
        const selectedItems = quickPick.selectedItems;
        if (selectedItems.length > 0) {
          // For now, just show selected files (we'll implement copying in next phase)
          const fileList = selectedItems
            .map(item => item.label)
            .join("\n");
          vscode.window.showInformationMessage(
            `Selected files:\n${fileList}`
          );
        }
        quickPick.hide();
      });

      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.show();
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}