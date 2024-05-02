import { DiagnosticLevel } from '../common/configOptions';
import { Diagnostic } from '../common/diagnostic';
import { DiagnosticRule } from '../common/diagnosticRules';
import { Localizer } from '../localization/localize';
import { ParseNode } from '../parser/parseNodes';
import { isFunction, isModule, isOverloadedFunction, Type } from './types';

type AddDiagnostic = (
    diagLevel: DiagnosticLevel,
    rule: string,
    message: string,
    node: ParseNode
) => Diagnostic | undefined;

export const device = 'micro:bit V1';

function getNames(type: Type) {
    if (isFunction(type)) {
        return {
            moduleName: type.details.moduleName,
            name: type.details.name,
        };
    }
    if (isOverloadedFunction(type)) {
        return {
            moduleName: type.overloads[0].details.moduleName,
            name: type.overloads[0].details.name,
        };
    }
    return {
        moduleName: '',
        name: '',
    };
}

export function usesMicrobitV2Api(moduleName: string, name?: string) {
    return (
        ['log', 'microphone', 'speaker', 'power'].includes(moduleName) ||
        (moduleName === 'microbit' && name === 'run_every') ||
        (moduleName === 'neopixel' && ['fill', 'write'].includes(name ?? ''))
    );
}

function addModuleVersionWarning(
    addDiagnostic: AddDiagnostic,
    diagLevel: DiagnosticLevel,
    moduleName: string,
    node: ParseNode
) {
    addDiagnostic(
        diagLevel,
        DiagnosticRule.reportMicrobitV2ApiUse,
        Localizer.Diagnostic.microbitV2ModuleUse().format({
            moduleName: moduleName,
            device,
        }),
        node
    );
}

function addModuleMemberVersionWarning(
    addDiagnostic: AddDiagnostic,
    diagLevel: DiagnosticLevel,
    name: string,
    moduleName: string,
    node: ParseNode
) {
    addDiagnostic(
        diagLevel,
        DiagnosticRule.reportMicrobitV2ApiUse,
        Localizer.Diagnostic.microbitV2ModuleMemberUse().format({
            name,
            moduleName,
            device,
        }),
        node
    );
}

function addClassMethodVersionWarning(
    addDiagnostic: AddDiagnostic,
    diagLevel: DiagnosticLevel,
    methodName: string,
    className: string,
    node: ParseNode
) {
    addDiagnostic(
        diagLevel,
        DiagnosticRule.reportMicrobitV2ApiUse,
        Localizer.Diagnostic.microbitV2ClassMethodUse().format({
            methodName,
            className,
            device,
        }),
        node
    );
}

export function maybeAddMicrobitVersionWarning(
    type: Type,
    node: ParseNode,
    addDiagnostic: AddDiagnostic,
    diagLevel: DiagnosticLevel,
    memberName?: string
) {
    if (isModule(type)) {
        if (usesMicrobitV2Api(type.moduleName, memberName)) {
            addModuleVersionWarning(addDiagnostic, diagLevel, type.moduleName, node);
        }
    }

    const { moduleName, name } = getNames(type);
    if (!moduleName && !name) {
        return;
    }

    if (usesMicrobitV2Api(moduleName, name)) {
        if (isFunction(type) && type.boundToType) {
            const className = type.boundToType?.details.name;
            addClassMethodVersionWarning(addDiagnostic, diagLevel, name, className, node);
            return;
        }

        if (isFunction(type) || isOverloadedFunction(type)) {
            addModuleMemberVersionWarning(addDiagnostic, diagLevel, name, moduleName, node);
        }
    }
}
