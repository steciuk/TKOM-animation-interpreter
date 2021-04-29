class AstNode {
    constructor(token) {
        this.token = token
    }
}

export class BinaryOp extends AstNode {
    constructor(left, right, token) {
        super(token)
        this.left = left
        this.right = right
        this.op = token.type
    }
}

export class Float extends AstNode {
    constructor(token) {
        super(token)
        this.value = token.value
    }
}

export class Int extends AstNode {
    constructor(token) {
        super(token)
        this.value = token.value
    }
}

export class UnaryOp extends AstNode {
    constructor(token, right) {
        super(token)
        this.right = right
        this.op = token.type
    }
}

export class Identifier extends AstNode {
    constructor(token) {
        super(token)
        this.name = token.value
    }
}

export class FuncCall extends AstNode {
    constructor(token, args) {
        super(token)
        this.name = token.value
        this.args = args
    }
}

export class VarOrAttribute extends AstNode {
    constructor(token, attribute) {
        super(token)
        this.name = token.value
        this.attribute = attribute
    }
}