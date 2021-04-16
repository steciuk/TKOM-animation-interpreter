export class Token {
    //optional parameter "value", undefined if not passed
    constructor(type, lineNum, charNum, { value } = {}) { 
        this.type = type;
        this.value = value;
        this.lineNum = lineNum;
        this.charNum = charNum; 
    }

    toString() {
        return `${this.type}: (${this.lineNum}, ${this.charNum}): ${this.value}`;
    }
}

export let tokenType = {
    COMMA : 'COMMA',
    COMMENT : 'COMMENT',
    CURLYCLOSE : 'CURLYCLOSE',
    CURLYOPEN : 'CURLYOPEN',
    DIVIDE : 'DIVIDE',
    DOT : 'DOT',
    ELSE : 'ELSE',
    EOF : 'EOF',
    EQUALS : 'EQUALS',
    FLOAT : 'FLOAT',
    FOR : 'FOR',
    FUNC : 'FUNC',
    GREATER : 'GREATER',
    IDENTIFIER : 'IDENTIFIER',
    IF : 'IF',
    INT : 'INT',
    LESS : 'LESS',
    MINUS : 'MINUS',
    MULTIPLY : 'MULTIPLY',
    NOT : 'NOT',
    PARENTHCLOSE : 'PARENTHCLOSE',
    PARENTHOPEN : 'PARENTHOPEN',
    PLUS : 'PLUS',
    RETURN : 'RETURN',
    SEMICOLON : 'SEMICOLON',
    UNKNOWN : 'UNKNOWN',    
}

//TODO: zamień na tokentypy
export let keyWords = {
    'else' : tokenType.ELSE,
    'for' : tokenType.FOR,
    'func' : tokenType.FUNC,
    'if' : tokenType.IF,
    'return' : tokenType.RETURN
}

export let specialChar = {    
    '-' : tokenType.MINUS,
    '!' : tokenType.NOT,
    '(' : tokenType.PARENTHOPEN,
    ')' : tokenType.PARENTHCLOSE,
    '*' : tokenType.MULTIPLY,
    ',' : tokenType.COMMA,
    '.' : tokenType.DOT,
    '/' : tokenType.DIVIDE,
    ';' : tokenType.SEMICOLON,
    '{' : tokenType.CURLYOPEN,
    '}' : tokenType.CURLYCLOSE,
    '+' : tokenType.PLUS,
    '<' : tokenType.LESS,
    '=' : tokenType.EQUALS,
    '>' : tokenType.GREATER
}