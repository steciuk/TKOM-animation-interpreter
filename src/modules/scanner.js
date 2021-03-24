/* Wyodrębnia znaki i grupuje je w atomy leksykalne -
tokeny (słowa kluczowe, identyfikatory, operatory)

Czyta program źródłowy znak po znaku i
przekształca go w sekwencję atomów leksykalnych -
tokenów
Opisywanych: typ, wartość

*/
import { Token, tokenType } from './token.js';

export class Scanner {
    constructor(code) {
        this.code = code;
        this.lineNum = 1;
        this.charNum = 1;
        this.pos = 0;
        this.codeLength = code.length;

        this.currentChar = this.code[this.pos];
        this.nextChar = this.code[this.pos + 1];
    }

    getToken() {
        while (true){
            if (!this.nextChar) return new Token(tokenType.EOF, this.lineNum, this.charNum);
            this._skipWhite();
            console.log(this.nextChar);


            this._moveCursor();
        }
    }

    //TODO: check for browser specific whites
    _skipWhite() {
        while(isWhite(this.currentChar)) this._moveCursor();
    }

    _moveCursor() {
        this.pos++;
        this.charNum++;
        this.currentChar = this.code[this.pos];
        this.nextChar = this.code[this.pos + 1];
        if (isNewLineWin(this.currentChar + this.nextChar)) {
            this.pos++;
            this.charNum = 1;
            this.lineNum++;
        } else if (isNewLine(this.currentChar)) {
            this.charNum = 1;
            this.lineNum++;
        }
    }

}

function isNewLine(char) {
    return (char === '\r' || char === '\n');
}

function isNewLineWin(char) {
    return (char === '\r\n' || char === '\n\r');
}

function isWhite(char) {
    return (char === '\r' || char === '\n' || char === ' ' || char === '\t');
}