import { FileReaderError } from './error-handler.js';

export class Reader {
    constructor(code) {
        this.code = code;
        this.codeLength = this.code.length;
        this.pos = 0;
    }

    nextChar() {
        let char = this.code[this.pos]
        if(char === undefined) return '~~';
        while(char === '\r') {
            this.pos++;
            char = this.code[this.pos];
        }

        this.pos++;
        return char;
    }

    // prevChar(n) {
    //     if(this.pos - n < 0) throw new FileReaderError("Buffer index < 0")
    //     this.pos -= n;
    //     return this.code[this.pos];
    // }
}