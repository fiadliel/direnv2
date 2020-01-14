import { EnvironmentVariableProvider } from "./EnvironmentVariableProvider";
import * as child_process from 'child_process';
import * as vscode from 'vscode';

export class DirenvEnvironmentVariableProvider implements EnvironmentVariableProvider {
    workspaceWatchers: Map<vscode.WorkspaceFolder, [vscode.FileSystemWatcher, Set<string | undefined>]>;
    eventEmitter: vscode.EventEmitter<vscode.WorkspaceFolder | undefined>;

    constructor() {
        this.workspaceWatchers = new Map();
        this.eventEmitter = new vscode.EventEmitter();
    }

    addWorkspaceFolder(workspaceName: string | undefined, folder: vscode.WorkspaceFolder) {
        let existing = this.workspaceWatchers.get(folder);

        if (existing) {
            existing[1].add(workspaceName);
        } else {
            let newWatcher = vscode.workspace.createFileSystemWatcher("/.envrc", false, false, false);
            newWatcher.onDidChange(_e => this.eventEmitter.fire(folder));
            newWatcher.onDidCreate(_e => this.eventEmitter.fire(folder));
            newWatcher.onDidDelete(_e => this.eventEmitter.fire(folder));
            this.workspaceWatchers.set(folder, [newWatcher, new Set(workspaceName)]);
        }
    }

    removeWorkspaceFolder(workspaceName: string | undefined, folder: vscode.WorkspaceFolder) {
        let existing = this.workspaceWatchers.get(folder);

        if (existing) {
            existing[1].delete(workspaceName);

            if (existing[1].size === 0) {
                existing[0].dispose();
                this.workspaceWatchers.delete(folder);
            }
        }
    }

    dispose(): void {
        for (const [, watcher] of this.workspaceWatchers) {
            watcher[0].dispose();
        }
        this.eventEmitter.dispose();
    }

    runDirenv(workspaceFolder: vscode.WorkspaceFolder | undefined, env: {
        [key: string]: string | undefined;
    }): vscode.ProviderResult<{
        [key: string]: string | undefined;
    }> {
        vscode.window.showInformationMessage("runDirenv");

        return new Promise((resolve, reject) => {
            if (workspaceFolder === undefined) {
                vscode.window.showInformationMessage("No workspace folder");
                resolve(undefined);
            } else {
                vscode.window.showInformationMessage("running direnv");
                child_process.exec('direnv export json', {
                    cwd: workspaceFolder.uri.fsPath, env: env
                }, (error, stdout, _stderr) => {
                    if (error) {
                        vscode.window.showInformationMessage("failed");
                        resolve(undefined);
                    }

                    vscode.window.showInformationMessage("succeeded");

                    try {
                        let json = JSON.parse(stdout);
                        vscode.window.showInformationMessage(`parsed json: ${json}`);
                        resolve({ ...env, ...json });
                    } catch (e) {
                        resolve(undefined);
                    }
                });
            }

        });
    }

    // EnvironmentVariableProvider implementation

    provideEnvironmentVariables(workspaceFolder: vscode.WorkspaceFolder | undefined, env: {
        [key: string]: string | undefined;
    }): vscode.ProviderResult<{
        [key: string]: string | undefined;
    }> {
        vscode.window.showInformationMessage('start of providing env variables');
        return this.runDirenv(workspaceFolder, env);
    }

    onDidUpdateEnvironmentVariables?: vscode.Event<vscode.WorkspaceFolder | undefined> | undefined;
    //    this.eventEmitter.event;
}
