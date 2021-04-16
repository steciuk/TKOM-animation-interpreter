import { FileReaderError } from './error-handler.js';

export class Reader {
    constructor(code) {
        this.code = code;
        this._refactorWhites();
        this.codeLength = this.code.length;
        this.pos = 0;
    }

    _refactorWhites() {
        let lines = this.code.split(/\r?\n/);
        this.code = lines.join('\n');
        console.log(this.code);
    }

    nextChar() {
        if(this.pos == this.codeLength) return '~~';
        return this.code[this.pos++];
    }

    prevChar(n) {
        if(this.pos - n < 0) throw new FileReaderError("Buffer index < 0")
        this.pos -= n;
        return this.code[this.pos];
    }
}