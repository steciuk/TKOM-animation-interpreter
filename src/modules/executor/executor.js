import { astNodes } from '../parser/ast-nodes.js';
import { tokenType } from '../token.js';
import { ExecutorError } from '../error-handler.js';
import { execNodes } from './exec-nodes.js';

export class Executor {
    constructor(program) {
        this.program = program;
        this.instNum = -1;
        this.currentInst = this.program.instructions[0];
    }

    execute() {
        let mainScope = new Scope(null);

        while (this._nextInst()) {
            if (this._executeAssignment(mainScope)) continue;
        }

        console.log(mainScope);
    }

    _nextInst() {
        if (this.instNum < this.program.instructions.length - 1) {
            this.instNum++;
            this.currentInst = this.program.instructions[this.instNum];
            return true;
        }

        return false;
    }

    _executeAssignment(scope) {
        if (!isObjOfClass(this.currentInst, astNodes.Assignment)) return null;

        let value = this._evaluateValue(scope, this.currentInst.right);
        scope.vars.set(this.currentInst.left.sym, value);
    }

    _evaluateValue(scope, node) {
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
            const variable = this._getAttribute(scope, node);
            if (!variable) throwUndefinedError(node);
            return variable;
        }
        if (isObjOfClass(node, astNodes.FuncCall))
            return this._evaluateFunction(node);
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
    }

    // user can override lib function
    _evaluateFunction(node) {
        let func = this.program.funMap.get(node.sym);
        if (func) {
            const result = this._executeUserFunction(func, node.args);
            if (typeof result === 'undefined') throwNoReturnError(node);
            return result;
        }
        if (this.program.libFunMap) {
            func = this.program.libFunMap.get(node.sym);
            if (func) {
                const result = func(node.args);
                if (typeof result === 'undefined') throwNoReturnError(node);
                return result;
            }
        }

        throwUndefinedError(node);
    }

    _getAttribute(scope, node) {
        const variable = searchInScope(scope, node.sym);
        if (!variable) return null;

        const attributes = node.attribute;
        for (attr of attributes) {
            const tempAttr = variable[attr];
            if (typeof tempAttr === 'undefined')
                throwNoAttributeError(node, variable, attr);

            variable = tempAttr;
        }

        return variable;
    }

    _executeUserFunction(func, args) {
        //TODO:
        console.log(func);
        console.log(args);
    }
}

function isObjOfClass(obj, cls) {
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

function throwNoAttributeError(node, variable, attribute) {
    throw new ExecutorError(
        `${node.token.lineNum} : ${node.token.charNum} : Object of type ${variable.constructor.name} doesn't have property ${attribute}`
    );
}

function throwDivideBy0Error(node) {
    throw new ExecutorError(
        `${node.token.lineNum} : ${node.token.charNum} : Division by 0!`
    );
}

function throwNoReturnError(node) {
    throw new ExecutorError(
        `${node.token.lineNum} : ${node.token.charNum} : Function "${node.sym}" was expected to return a value!`
    );
}

function throwOperatorError(node) {
    throw new ExecutorError(
        `${node.token.lineNum} : ${node.token.charNum} : Can't use arith operator on non-numeric value!`
    );
}

// got - object, expected - class
function throwWrongTypeError(node, got, expected) {
    throw new ExecutorError(
        `${node.token.lineNum} : ${node.token.charNum} : Wrong datatype! 
        Expected: ${expected.name}, 
        Got : ${got.constructor.name}`
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
