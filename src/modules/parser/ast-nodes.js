class AstNode {
    constructor(token) {
        this.token = token;
    }
}

export class BinaryOp extends AstNode {
    constructor(left, right, token) {
        super(token);
        this.left = left;
        this.right = right;
        this.op = token.type;
    }
}

export class Assignment extends AstNode {
    constructor(left, right, token) {
        super(token);
        this.left = left;
        this.right = right;
    }
}

export class Float extends AstNode {
    constructor(token) {
        super(token);
        this.value = token.value;
    }
}

export class Int extends AstNode {
    constructor(token) {
        super(token);
        this.value = token.value;
    }
}

export class UnaryOp extends AstNode {
    constructor(token, right) {
        super(token);
        this.right = right;
        this.op = token.type;
    }
}

export class Var extends AstNode {
    constructor(token) {
        super(token);
        this.sym = token.value;
    }
}

export class FuncCall extends AstNode {
    constructor(token, args) {
        super(token);
        this.sym = token.value;
        this.args = args;
    }
}

export class VarAndAttribute extends AstNode {
    constructor(token, attribute) {
        super(token);
        this.sym = token.value;
        this.attribute = attribute;
    }
}

export class Comment extends AstNode {
    constructor(token) {
        super(token);
        this.comment = token.value;
    }
}

export class Transformation extends AstNode {
    constructor(token, trans) {
        super(token);
        this.trans = trans;
        this.shape = token.value;
    }
}

export class FuncDef extends AstNode {
    constructor(token, params, commands) {
        super(token);
        this.sym = token.value;
        this.params = params;
        this.commands = commands;
    }
}

export class ReturnStatement extends AstNode {
    constructor(token, returnVal) {
        super(token);
        this.returnVal = returnVal;
    }
}

export class IfStatement extends AstNode {
    constructor(token, condition, ifBlock, elseBlock) {
        super(token);
        this.condition = condition;
        this.ifBlock = ifBlock;
        this.elseBlock = elseBlock;
    }
}

export class ForStatement extends AstNode {
    constructor(token, numOfIterations, commands) {
        super(token);
        this.numOfIterations = numOfIterations;
        this.commands = commands;
    }
}

export class AsyncForStatement extends AstNode {
    constructor(token, numOfIterations, delay, commands) {
        super(token);
        this.numOfIterations = numOfIterations;
        this.delay = delay;
        this.commands = commands;
    }
}

export const astNodes = {
    BinaryOp: BinaryOp,
    Assignment: Assignment,
    Float: Float,
    Int: Int,
    UnaryOp: UnaryOp,
    Var: Var,
    FuncCall: FuncCall,
    VarAndAttribute: VarAndAttribute,
    Comment: Comment,
    Transformation: Transformation,
    FuncDef: FuncDef,
    ReturnStatement: ReturnStatement,
    IfStatement: IfStatement,
    ForStatement: ForStatement,
    AsyncForStatement: AsyncForStatement,
};
