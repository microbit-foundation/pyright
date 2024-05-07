import { DiagnosticLevel } from '../common/configOptions';
import { Diagnostic } from '../common/diagnostic';
import { DiagnosticRule } from '../common/diagnosticRules';
import { Localizer } from '../localization/localize';
import { ParseNode } from '../parser/parseNodes';
import { AnalyzerFileInfo } from './analyzerFileInfo';
import * as AnalyzerNodeInfo from './analyzerNodeInfo';
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

function usesMicrobitV2Api(moduleName: string, name?: string) {
    return (
        ['log', 'microphone', 'speaker', 'power'].includes(moduleName) ||
        (moduleName === 'microbit' && name === 'run_every') ||
        (moduleName === 'neopixel' && ['fill', 'write'].includes(name ?? ''))
    );
}

function getFileInfo(node: ParseNode): AnalyzerFileInfo {
    return AnalyzerNodeInfo.getFileInfo(node);
}

function getDiagLevel(fileInfo: AnalyzerFileInfo): DiagnosticLevel {
    return fileInfo.diagnosticRuleSet.reportMicrobitV2ApiUse;
}

function addModuleVersionWarning(addDiagnostic: AddDiagnostic, moduleName: string, node: ParseNode) {
    const fileInfo = getFileInfo(node);
    addDiagnostic(
        getDiagLevel(fileInfo),
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
    name: string,
    moduleName: string,
    node: ParseNode
) {
    const fileInfo = getFileInfo(node);
    addDiagnostic(
        getDiagLevel(fileInfo),
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
    methodName: string,
    className: string,
    node: ParseNode
) {
    const fileInfo = getFileInfo(node);
    addDiagnostic(
        getDiagLevel(fileInfo),
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
    memberName?: string
) {
    if (isModule(type)) {
        if (usesMicrobitV2Api(type.moduleName, memberName)) {
            addModuleVersionWarning(addDiagnostic, type.moduleName, node);
        }
    }

    const { moduleName, name } = getNames(type);
    if (!moduleName && !name) {
        return;
    }

    if (usesMicrobitV2Api(moduleName, name)) {
        if (isFunction(type) && type.boundToType) {
            const className = type.boundToType?.details.name;
            addClassMethodVersionWarning(addDiagnostic, name, className, node);
            return;
        }

        if (isFunction(type) || isOverloadedFunction(type)) {
            addModuleMemberVersionWarning(addDiagnostic, name, moduleName, node);
        }
    }
}

// Required as passing in this._addDiagnostic results in errors.
// See binder.ts for use.
export function maybeAddMicrobitVersionWarningBinderWrapper(moduleName: string, callback: any) {
    if (usesMicrobitV2Api(moduleName)) {
        callback();
    }
}
