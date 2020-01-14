import * as vscode from 'vscode';
import { DirenvEnvironmentVariableProvider } from './DirenvEnvironmentVariableProvider';
import { EnvironmentVariableProvider } from './EnvironmentVariableProvider';

export function activate(context: vscode.ExtensionContext): EnvironmentVariableProvider {
	let direnvProvider = new DirenvEnvironmentVariableProvider();

	if (vscode.workspace.workspaceFolders !== undefined) {
		vscode.workspace.workspaceFolders.forEach(folder => direnvProvider.addWorkspaceFolder(vscode.workspace.name, folder));
	}

	vscode.workspace.onDidChangeWorkspaceFolders(evt => {
		evt.added.forEach(folder => direnvProvider.addWorkspaceFolder(vscode.workspace.name, folder));
		evt.removed.forEach(folder => direnvProvider.removeWorkspaceFolder(vscode.workspace.name, folder));
	});

	context.subscriptions.push(direnvProvider);

	return direnvProvider;
}

export function deactivate() {

}
