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
    }

    getToken() {
        console.log(this.code);
    }

    skipWhite() {
        while(this.pos <= this.codeLength) {

        }
    }

    moveToNext() {
        
    }

}

