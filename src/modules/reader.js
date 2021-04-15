export class Reader {
    constructor(code) {
        this.code = code;
        this._refactorEOLs();
        this.codeLength = code.length;
        this.pos = 0;
    }

    _refactorWhites() {
        let lines = this.code.split(/\r?\n/);
        this.code = lines.join('\n');
        console.log(this.code);
    }

    nextChar() {
        if(this.pos == this.codeLength) return -1;
        return this.code[this.pos++];
    }
}