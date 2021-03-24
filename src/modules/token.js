//TODO:: Default value of null
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
    IDENTIFIER : 'IDENTIFIER',
    EOF : 'EOF',
    KEYWORD : 'KEYWORD',
    FLOAT : 'FLOAT',
    INT : 'INT',
    COMMENT : 'COMMENT',
    PARENTHOPEN : 'PARENTHOPEN',
    PARENTHCLOSE : 'PARENTHCLOSE',
    BRACKETOPEN : 'BRACKETOPEN',
    BRACKETCLOSE : 'BRACKETCLOSE',
    COMMA : 'COMMA',
    DOT : 'DOT',
    SEMICOLON : 'SEMICOLON',
    PLUS : 'PLUS',
    MINUS : 'MINUS',
    MULTIPLY : 'MULTIPLY',
}

export let keyWords = [
    'animation',
    'canvas',
    'circle',
    'color',
    'height',
    'iterations',
    'move',
    'polygon',
    'posx',
    'posy',
    'radius',
    'rectangle',
    'rgb',
    'rotate',
    'scale',
    'shearx',
    'sheary',
    'show',
    'step',
    'triangle',
    'width'
]

export let specialChar = {    
    '(' : tokenType.PARENTHOPEN,
    ')' : tokenType.PARENTHCLOSE,
    '[' : tokenType.BRACKETOPEN,
    ']' : tokenType.BRACKETCLOSE,
    ',' : tokenType.COMMA,
    '.' : tokenType.DOT,
    ';' : tokenType.SEMICOLON,
    '+' : tokenType.PLUS,
    '-' : tokenType.MINUS,
    '*' : tokenType.MULTIPLY,
}