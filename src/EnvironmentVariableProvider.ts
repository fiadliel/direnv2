import { Event, ProviderResult, WorkspaceFolder } from 'vscode';

export interface EnvironmentVariableProvider {
    provideEnvironmentVariables(workspaceFolder: WorkspaceFolder | undefined, env: {
        [key: string]: string | undefined;
    }): ProviderResult<{
        [key: string]: string | undefined;
    }>;
    onDidUpdateEnvironmentVariables?: Event<WorkspaceFolder | undefined>;
}
