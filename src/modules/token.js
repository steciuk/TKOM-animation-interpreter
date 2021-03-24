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
    TEST : 'TEST',
    EOF : 'EOF'
}