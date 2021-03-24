//TODO:: Default value of null
export class Token {
    constructor(type, value, lineNum, charNum) {
        this.type = type;
        this.value = value;
        this.lineNum = lineNum;
        this.charNum = charNum;
    }
}

export let tokenType = {
    TEST : "TEST",
    EOF : "EOF"
}