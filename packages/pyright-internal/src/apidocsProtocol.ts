// A custom extension to LSP.

import { MarkupKind, ProtocolRequestType } from 'vscode-languageserver-protocol';

export interface ApiDocsParams {
    modules: string[];
    path: string;
    documentationFormat?: MarkupKind[];
}

export interface ApiDocsBaseClass {
    name: string;
    fullName: string;
}

export type ApiDocsFunctionParameterCategory = 'simple' | 'varargList' | 'varargDict';

export interface ApiDocsFunctionParameter {
    name: string;
    category: ApiDocsFunctionParameterCategory;
    defaultValue?: string;
}

export interface ApiDocsEntry {
    id: string;
    name: string;
    docString?: string;
    fullName: string;
    kind: 'function' | 'module' | 'class' | 'variable';
    children?: ApiDocsEntry[];
    baseClasses?: ApiDocsBaseClass[];
    params?: ApiDocsFunctionParameter[];
}

export interface ApiDocsResponse extends Record<string, ApiDocsEntry> {}

export const apiDocsRequestType = new ProtocolRequestType<ApiDocsParams, ApiDocsResponse, never, void, void>(
    'pyright/apidocs'
);
