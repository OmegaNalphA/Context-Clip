import * as vscode from "vscode";

interface EditorQuickPickItem extends vscode.QuickPickItem {
  uri: vscode.Uri;
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "contextclip.copyOpenEditors",
    async () => {
      // Get all tab groups and their tabs
      const allTabs = vscode.window.tabGroups.all.flatMap((group) =>
        group.tabs
          .filter((tab) => tab.input instanceof vscode.TabInputText)
          .map((tab) => (tab.input as vscode.TabInputText).uri)
      );

      // If no editors are open, show a message and return
      if (allTabs.length === 0) {
        vscode.window.showInformationMessage("No editors are currently open.");
        return;
      }

      // Create QuickPick items from tabs
      const items: EditorQuickPickItem[] = allTabs.map((uri) => {
        return {
          label: vscode.workspace.asRelativePath(uri),
          description: uri.fsPath,
          uri: uri,
        };
      });

      // Create and show QuickPick
      const quickPick = vscode.window.createQuickPick<EditorQuickPickItem>();
      quickPick.items = items;
      quickPick.placeholder =
        "All files selected. Click to deselect files you don't want to copy";
      quickPick.canSelectMany = true;
      quickPick.selectedItems = items;

      quickPick.onDidAccept(async () => {
        const selectedItems = quickPick.selectedItems;
        if (selectedItems.length > 0) {
          // Get contents of all selected files and format them
          const fileContents = await Promise.all(
            selectedItems.map(async (item) => {
              const document = await vscode.workspace.openTextDocument(
                item.uri
              );
              const content = document.getText();
              const relativePath = `./${vscode.workspace.asRelativePath(
                item.uri,
                true
              )}`;

              return `${relativePath}\n\n\`\`\`\n${content}\n\`\`\``;
            })
          );

          // Join all file contents with double newlines between them
          const clipboardContent = fileContents.join("\n\n");

          // Copy to clipboard
          await vscode.env.clipboard.writeText(clipboardContent);

          vscode.window.showInformationMessage(
            `Copied ${selectedItems.length} file(s) to clipboard`
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
