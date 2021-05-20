export class FileReaderError extends Error {
    constructor(message) {
        super(message);
    }
}

export class LexicalError extends Error {
    constructor(message) {
        super(message);
        this.lineNum = lineNum;
        this.charNum = charNum;
    }
}

export class SyntaxError extends Error {
    constructor(message) {
        super(message);
    }
}

export class ParseError extends Error {
    constructor(message) {
        super(message);
    }
}

export class SemanticError extends Error {
    constructor(message) {
        super(message);
    }
}

export class ExecutorError extends Error {
    constructor(message) {
        super(message);
    }
}
