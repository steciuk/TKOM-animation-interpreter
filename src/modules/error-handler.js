export class FileReaderError extends Error {
    constructor(message) {
        super(message);
    }
}

export class LexicalError extends Error {
    constructor(message, lineNum, charNum) {
        super(message);
        this.lineNum = lineNum;
        this.charNum = charNum;
    }
}

export class SyntaxError extends Error {
    constructor(message, lineNum, charNum) {
        super(message);
        this.lineNum = lineNum;
        this.charNum = charNum;
    }
}

export class ParseError extends Error {
    constructor(message, lineNum, charNum) {
        super(message);
        this.lineNum = lineNum;
        this.charNum = charNum;
    }
}

export class SemanticError extends Error {
    constructor(message, lineNum, charNum) {
        super(message);
        this.lineNum = lineNum;
        this.charNum = charNum;
    }
}