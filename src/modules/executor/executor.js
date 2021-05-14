import { astNodes } from '../parser/ast-nodes.js';
import { tokenType } from '../token.js';
import { ExecutorError } from '../error-handler.js';
import { Numeric, Int, Float, execNodes } from './exec-nodes.js';

export class Executor {
    constructor(program) {
        this.program = program;
        this.instNum = -1;
        this.currentInst = this.program.instructions[0];
    }

    execute() {
        let mainScope = new Scope(null);
        this._executeAssignment(mainScope);

        // while (this._nextInst()) {
        //     if (this.executeAssignmen€t(mainScope)) continue;
        // }
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
        if (!isObjOfClass(this.currentInst, astNodes.Assignment)) return false;

        //let variable = searchInScope(scope, this.currentInst.left.name);
        let variable = evaluateValue(scope, this.currentInst.right);
        console.log(variable);
    }
}

function evaluateValue(scope, node) {
    console.log(node);
    if (isObjOfClass(node, astNodes.Int)) return node.value;
    if (isObjOfClass(node, astNodes.Float)) return node.value;
    if (isObjOfClass(node, astNodes.UnaryOp))
        return -evaluateValue(scope, node.right);
    if (isObjOfClass(node, astNodes.Var)) {
        const variable = searchInScope(scope);
        if (!variable) throwUndefinedError(node);
        if (!isObjChildOfClass(variable, execNodes.Numeric))
            throwWrongTypeError(node, variable, execNodes.Numeric);

        return variable.value;
    }
    //if (isObjOfClass(node, astNodes.VarAndAttribute)) TODO:
    //if (isObjOfClass(node, astNodes.FuncCall)) TODO:
    if (isObjOfClass(node, astNodes.BinaryOp)) {
        if (node.op === tokenType.MULTIPLY)
            return (
                evaluateValue(scope, node.left) *
                evaluateValue(scope, node.right)
            );
        if (node.op === tokenType.DIVIDE)
            return (
                evaluateValue(scope, node.left) /
                evaluateValue(scope, node.right)
            );
        if (node.op === tokenType.PLUS)
            return (
                evaluateValue(scope, node.left) +
                evaluateValue(scope, node.right)
            );
        if (node.op === tokenType.MINUS)
            return (
                evaluateValue(scope, node.left) -
                evaluateValue(scope, node.right)
            );
    }
}

function isObjOfClass(obj, cls) {
    return obj.constructor === cls;
}

function isObjChildOfClass(obj, cls) {
    return obj instanceof cls;
}

function searchInScope(scope, name) {
    let variable = scope.vars.get(name);
    if (variable) return variable;

    while (scope.parentScope !== null);
    {
        scope = scope.parentScope;
        variable = scope.vars.get(name);
        if (variable) return variable;
    }

    return false;
}

function throwUndefinedError(node) {
    throw new ExecutorError(
        `${node.token.lineNum} : ${node.token.charNum} : Undefined reference: ${node.name}`
    );
}

function throwWrongTypeError(node, got, expected) {
    throw new ExecutorError(
        `${node.token.lineNum} : ${node.token.charNum} : Wrong datatype! 
        Expected: ${expected.name}, 
        Got : ${got.constructor.name}`
    );
}

function throwExecutorError(node, message) {
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
