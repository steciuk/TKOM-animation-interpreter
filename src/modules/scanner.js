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
        this.charNum = 0;
        this.pos = 0;
        this.codeLength = code.length;

        this.currentChar = '';
        this.nextChar = this.code[0];
    }

    getToken() {
        if (this.pos >= this.codeLength) return new Token(tokenType.EOF; )

        console.log(this.code);

    }

    //TODO: check for browser specific whites
    _skipWhite() {
        while(this.pos <= this.codeLength) {
            
        }
    }

    _moveCursor() {

    }

    
}

