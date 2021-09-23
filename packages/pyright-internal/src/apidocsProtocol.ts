// A custom extension to LSP.

import { ProtocolRequestType } from 'vscode-languageserver-protocol';

export interface ApiDocsParams {
    modules: string[];
    path: string;
}

export interface ApiDocsBaseClass {
    name: string;
    fullName: string;
}

export interface ApiDocsEntry {
    id: string;
    name: string;
    docString?: string;
    fullName: string;
    type?: string;
    kind: 'function' | 'module' | 'class' | 'variable';
    children?: ApiDocsEntry[];
    baseClasses?: ApiDocsBaseClass[];
}

export interface ApiDocsResponse extends Record<string, ApiDocsEntry> {}

export const apiDocsRequestType = new ProtocolRequestType<ApiDocsParams, ApiDocsResponse, never, void, void>(
    'pyright/apidocs'
);
