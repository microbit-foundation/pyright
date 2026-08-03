// A custom extension to LSP.
//
// Lists micro:bit Jacdac roles used in a file: the string-literal argument of
// calls to the Jacdac role constructors (jacdac_button, ...), for the editor's
// config/simulator. Reserved-character validation is a separate checker
// diagnostic (see checker.ts). The callee is resolved via the type evaluator, so
// aliases match and unrelated same-named calls are ignored.

import { ProtocolRequestType } from 'vscode-languageserver-protocol';

export interface JacdacRolesParams {
    // The file to analyse, e.g. the user's main module.
    path: string;
}

export interface JacdacRole {
    // The role name: the decoded value of the string-literal argument.
    name: string;
    // The constructor class that was called, e.g. 'jacdac_button'.
    constructorName: string;
}

export interface JacdacRolesResponse {
    roles: JacdacRole[];
}

export const jacdacRolesRequestType = new ProtocolRequestType<
    JacdacRolesParams,
    JacdacRolesResponse,
    never,
    void,
    void
>('pyright/jacdacRoles');
