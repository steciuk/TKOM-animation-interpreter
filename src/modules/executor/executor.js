import { astNodes } from '../parser/ast-nodes.js';
import { tokenType } from '../token.js';
import { ExecutorError } from '../error-handler.js';
import { execNodes } from './exec-nodes.js';

export class Executor {
    constructor(program) {
        this.program = program;
    }

    executeProgram() {
        let scope = new Scope(null);
        const retVal = this._execute(scope, this.program.instructions);
        console.log(scope);
        return retVal;
    }

    _execute(scope, instructions) {
        for (const instruction of instructions) {
            if (isObjOfClass(instruction, astNodes.Assignment))
                this._executeAssignment(scope, instruction);
            else if (isObjOfClass(instruction, astNodes.IfStatement)) {
                const result = this._executeIf(scope, instruction);
                if (typeof result !== 'undefined') return result;
            } else if (isObjOfClass(instruction, astNodes.ForStatement)) {
                const result = this._executeFor(scope, instruction);
                if (typeof result !== 'undefined') return result;
            } else if (isObjOfClass(instruction, astNodes.FuncCall)) {
                this._executeFunction(scope, instruction);
            } else if (isObjOfClass(instruction, astNodes.ReturnStatement))
                return this._executeReturn(scope, instruction);
        }

        return;
    }

    _executeFor(scope, node) {
        const numOfIterations = this._evaluateValue(
            scope,
            node.numOfIterations
        );
        for (let i = 0; i < numOfIterations; i++) {
            let newScope = new Scope(scope);
            const res = this._execute(newScope, node.commands);
            if (typeof res !== 'undefined') return res;
        }
    }

    _executeIf(scope, node) {
        const newScope = new Scope(scope);
        const condition = this._evaluateValue(scope, node.condition);
        console.log(condition);
        if (isNaN(condition)) throwNonBooleanError(node, condition);
        let res;
        if (condition) res = this._execute(newScope, node.ifBlock);
        else if (node.elseBlock) res = this._execute(newScope, node.elseBlock);
        if (typeof res !== undefined) return res;
    }

    _executeReturn(scope, instruction) {
        return this._evaluateValue(scope, instruction.returnVal);
    }

    _executeAssignment(scope, instruction) {
        let value = this._evaluateValue(scope, instruction.right);

        if (isObjOfClass(instruction.left, astNodes.VarAndAttribute)) {
            const [obj, variable] = [
                ...this._getAttribute(scope, instruction.left),
            ];
            variable.call(obj, value);
        } else {
            scope.vars.set(instruction.left.sym, value);
        }

        return true;
    }

    _evaluateValue(scope, node) {
        if (!node) return null;
        if (isObjOfClass(node, astNodes.Int)) return node.value;
        if (isObjOfClass(node, astNodes.Float)) return node.value;
        if (isObjOfClass(node, astNodes.UnaryOp)) {
            const r = this._evaluateValue(scope, node.right);
            if (isNaN(r)) throwOperatorError(node.right);
            return -r;
        }
        if (isObjOfClass(node, astNodes.Var)) {
            const variable = searchInScope(scope, node.sym);
            if (!variable) throwUndefinedError(node);

            return variable;
        }
        if (isObjOfClass(node, astNodes.VarAndAttribute)) {
            const [obj, variable] = [...this._getAttribute(scope, node)];
            return variable.call(obj, 'get');
        }
        if (isObjOfClass(node, astNodes.FuncCall))
            return this._evaluateFunction(scope, node);
        if (isObjOfClass(node, astNodes.BinaryOp))
            return this._evaluateBinary(scope, node);
    }

    _evaluateBinary(scope, node) {
        const l = this._evaluateValue(scope, node.left);
        if (isNaN(l)) throwOperatorError(node.left);
        const r = this._evaluateValue(scope, node.right);
        if (isNaN(r)) throwOperatorError(node.right);

        if (node.op === tokenType.MULTIPLY) return r * l;
        if (node.op === tokenType.DIVIDE) {
            if (r === 0) throwDivideBy0Error(node);
            return l / r;
        }
        if (node.op === tokenType.PLUS) return l + r;
        if (node.op === tokenType.MINUS) return l - r;

        if (node.op === tokenType.OR) return l || r;
        if (node.op === tokenType.AND) return l && r;
        if (node.op === tokenType.GREATER) return l > r;
        if (node.op === tokenType.LESS) return l < r;
        if (node.op === tokenType.GREATEROREQUALS) return l >= r;
        if (node.op === tokenType.LESSOREQUALS) return l <= r;
        if (node.op === tokenType.EQUALS) return l === r;
        if (node.op === tokenType.NOTEQUALS) return l === r;
    }

    _executeFunction(scope, node) {
        let func = this.program.funMap[node.sym];
        if (func) return this._executeUserFunction(scope, func, node);
        if (this.program.libFunMap) {
            func = this.program.libFunMap[node.sym];
            if (func) {
                const args = this._evaluateArgs(scope, node.args);
                // try {
                return func(args);
                // } catch (error) {
                //     throwStdLibError(node, error.message);
                // }
            }
        }

        throwUndefinedError(node);
    }

    _evaluateFunction(scope, node) {
        const result = this._executeFunction(scope, node);
        if (typeof result === 'undefined') throwNoReturnError(node);
        return result;
    }

    _evaluateArgs(scope, args) {
        let evaluatedArgs = [];
        for (const arg of args)
            evaluatedArgs.push(this._evaluateValue(scope, arg));
        return evaluatedArgs;
    }

    _getAttribute(scope, node) {
        let variable = searchInScope(scope, node.sym);
        if (!variable) throwUndefinedError(node);

        let obj;
        let func;
        const attributes = node.attribute;
        for (const attr of attributes) {
            func = variable[attr];
            if (typeof func === 'undefined')
                throwNoAttributeError(node, variable, attr);

            obj = variable;
            variable = func.call(variable, 'get');
        }

        return [obj, func];
    }

    _executeUserFunction(scope, func, node) {
        if (func.params.length !== node.args.length)
            throwWrongArgsNum(node, func.params.length, node.args.length);

        let newScope = new Scope(null);
        for (let i = 0; i < func.params.length; i++) {
            const value = this._evaluateValue(scope, node.args[i]);
            newScope.vars.set(func.params[i].sym, value);
        }

        return this._execute(newScope, func.commands);
    }
}

function isObjOfClass(obj, cls) {
    if (!obj) return false;
    return obj.constructor === cls;
}

function isObjChildOfClass(obj, cls) {
    return obj instanceof cls;
}

function searchInScope(scope, sym) {
    let variable = scope.vars.get(sym);
    if (variable) return variable;

    while (scope.parentScope !== null) {
        scope = scope.parentScope;
        variable = scope.vars.get(sym);
        if (variable) return variable;
    }

    return null;
}

function throwUndefinedError(node) {
    throw new ExecutorError(
        `${node.token.lineNum} : ${node.token.charNum} : Undefined reference: ${node.sym}`
    );
}

function throwNonBooleanError(node, value) {
    throw new ExecutorError(
        `${node.token.lineNum} : ${node.token.charNum} : Can't convert ${value} to boolean`
    );
}

function throwNoAttributeError(node, variable, attribute) {
    throw new ExecutorError(
        `${node.token.lineNum} : ${node.token.charNum} : Object of type ${variable.constructor.name} doesn't have property ${attribute}`
    );
}

function throwDivideBy0Error(node) {
    throw new ExecutorError(
        `${node.token.lineNum} : ${node.token.charNum} : Division by 0`
    );
}

function throwNoReturnError(node) {
    throw new ExecutorError(
        `${node.token.lineNum} : ${node.token.charNum} : Function "${node.sym}" was expected to return a value`
    );
}

function throwOperatorError(node) {
    throw new ExecutorError(
        `${node.token.lineNum} : ${
            node.token.charNum
        } : Can't use arith/cond operator on non-numeric value
        GOT: ${typeof node}`
    );
}

function throwWrongArgsNum(node, expected, got) {
    throw new ExecutorError(`${node.token.lineNum} : ${node.token.charNum} : Incorrect number of arguments
    Expected: ${expected}
    Got: ${got}`);
}

function throwStdLibError(node, message) {
    throw new ExecutorError(
        `${node.token.lineNum} : ${node.token.charNum} : ${message}`
    );
}

class Scope {
    constructor(parentScope) {
        this.parentScope = parentScope;
        this.vars = new Map();
    }
}

//18.05.2021
// Zgodził się Pan na "isObjectOfClass", bo w JS nie jest typowany i
// model wizytora wiązałby się z tworzeniem osobnych klas wizytora dla każdego węzła
// Zgodził się Pan na przekazywanie scopa i zoranizowanie go w strukturę drzewa z nullem
// jako korzeniem tworzonym w każdym funcallu, bo nie zakładam zmiennych globalnych
// i nie wymaga to tworzenia osobnego obiektu zarządzaniającego stosem pamięci
