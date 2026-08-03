/*
 * jacdacRoles.ts
 *
 * Identifies micro:bit Jacdac role constructor calls (e.g. jacdac_button("start"))
 * in a module. The callee is resolved through the type evaluator, so aliased
 * imports match and unrelated same-named functions/locals are ignored. Shared by
 * the pyright/jacdacRoles request (role listing for the editor) and the checker
 * (reserved-character diagnostics).
 */

import { JacdacRole } from '../jacdacRolesProtocol';
import {
    ArgumentCategory,
    CallNode,
    ModuleNode,
    ParseNodeType,
    StringListNode,
} from '../parser/parseNodes';
import { ParseTreeWalker } from './parseTreeWalker';
import { TypeEvaluator } from './typeEvaluatorTypes';
import { isInstantiableClass } from './types';

// Fully-qualified names of the supported Jacdac role constructor classes. Kept in
// step with the editor's JACDAC_MODULES (module name == class name).
export const JACDAC_ROLE_CONSTRUCTORS = new Set<string>([
    'jacdac_button.jacdac_button',
    'jacdac_rotary_encoder.jacdac_rotary_encoder',
    'jacdac_slider.jacdac_slider',
    'jacdac_led_ring.jacdac_led_ring',
    'jacdac_servo.jacdac_servo',
]);

// Characters reserved by Jacdac's role syntax that must not appear in a role name
// (query `?`, key=value `& =`, host grouping `/`, binding hints `[`, device:index `:`).
export const JACDAC_RESERVED_ROLE_CHARS = ['?', '&', '=', '/', '[', ':'];

export function reservedCharsInName(name: string): string[] {
    return JACDAC_RESERVED_ROLE_CHARS.filter((c) => name.includes(c));
}

// The decoded value of a plain string literal, or undefined for a non-static
// string (e.g. an f-string), which can't be a role name.
function staticStringValue(node: StringListNode): string | undefined {
    let result = '';
    for (const part of node.strings) {
        if (part.nodeType !== ParseNodeType.String) {
            return undefined;
        }
        result += part.value;
    }
    return result;
}

export interface JacdacRoleCall {
    name: string;
    constructorName: string;
    // The role-name string-literal node, used for diagnostic ranges.
    node: StringListNode;
}

/**
 * If `node` is a call to a supported Jacdac role constructor with a static
 * string-literal first argument, returns its details; otherwise undefined. The
 * callee is resolved via the evaluator (type-aware), so `import ... as` aliases
 * match and unrelated same-named callables don't.
 */
export function jacdacRoleFromCall(evaluator: TypeEvaluator, node: CallNode): JacdacRoleCall | undefined {
    const calleeType = evaluator.getType(node.leftExpression);
    if (
        !calleeType ||
        !isInstantiableClass(calleeType) ||
        !JACDAC_ROLE_CONSTRUCTORS.has(calleeType.details.fullName)
    ) {
        return undefined;
    }
    const firstArg = node.arguments.length > 0 ? node.arguments[0] : undefined;
    const value = firstArg?.valueExpression;
    if (
        !firstArg ||
        firstArg.argumentCategory !== ArgumentCategory.Simple ||
        firstArg.name !== undefined ||
        !value ||
        value.nodeType !== ParseNodeType.StringList
    ) {
        return undefined;
    }
    const name = staticStringValue(value);
    if (name === undefined) {
        return undefined;
    }
    return { name, constructorName: calleeType.details.name, node: value };
}

class JacdacRolesWalker extends ParseTreeWalker {
    readonly roles: JacdacRole[] = [];

    constructor(private readonly _evaluator: TypeEvaluator) {
        super();
    }

    override visitCall(node: CallNode): boolean {
        const role = jacdacRoleFromCall(this._evaluator, node);
        if (role) {
            this.roles.push({ name: role.name, constructorName: role.constructorName });
        }
        return true;
    }
}

export function extractJacdacRoles(moduleNode: ModuleNode, evaluator: TypeEvaluator): JacdacRole[] {
    const walker = new JacdacRolesWalker(evaluator);
    walker.walk(moduleNode);
    return walker.roles;
}
