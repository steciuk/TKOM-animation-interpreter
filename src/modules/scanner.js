import { Token, tokenType, keyWords, specialChar } from './token.js';
import { SyntaxError } from './error-handler.js';

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

            //comment
            if (this.currentChar === '#') return this._processComment();
            //identifier
            if (isAlpha(this.currentChar)) return this._processIdentifierOrKeyWord();
            //float and int
            if (isNumber(this.currentChar)) return this._processNumber();
            //special chars
            if (specialChar[this.currentChar]) return this._processSpecialChar();

            //no token fit
            throw new SyntaxError("Unknown token", this.lineNum, this.charNum);
        }
    }

    _processSpecialChar() {
        let char = this.currentChar;
        let tokenLineNum = this.lineNum;
        let tokenCharNum = this.charNum;
        this._moveCursor(1)
        return new Token(specialChar[char], tokenLineNum, tokenCharNum);
    }

    _processComment(){
        let tokenValue = "";
        let tokenLineNum = this.lineNum;
        let tokenCharNum = this.charNum;

        //skip "#"
        this._moveCursor(1);

        while(this.currentChar !== undefined && !isNewLine(this.currentChar)) {
            tokenValue += this.currentChar;
            this._moveCursor(1);
        }

        return new Token(tokenType.COMMENT, tokenLineNum, tokenCharNum, {value: tokenValue});
    }

    _processNumber() {
        let tokenValue = "";
        let tokenLineNum = this.lineNum;
        let tokenCharNum = this.charNum;

        // 0+number or 0+alpha error
        if (this.currentChar === '0' && isAlphaNum(this.nextChar)) throw new SyntaxError(this.currentChar + this.nextChar + "is NaN", tokenLineNum, tokenCharNum);
        
        //float
        if (this.nextChar === '.'){
            tokenValue = this.currentChar + '.';
            this._moveCursor(2);
            if(!isNumber(this.currentChar)) throw new SyntaxError("Missing decimals", tokenLineNum, tokenCharNum);
        }

        while(this.currentChar !== undefined && isNumber(this.currentChar)) {
            tokenValue += this.currentChar;
            this._moveCursor(1);
        }  

        tokenValue = Number(tokenValue);
        return (isInt(tokenValue) ? new Token(tokenType.INT, tokenLineNum, tokenCharNum, { value: tokenValue }) : new Token(tokenType.FLOAT, tokenLineNum, tokenCharNum, { value: tokenValue }));
    }

    _processIdentifierOrKeyWord() {
        let tokenValue = "";
        let tokenLineNum = this.lineNum;
        let tokenCharNum = this.charNum;
        while(this.currentChar !== undefined && isAlphaNum(this.currentChar)) {
            tokenValue += this.currentChar;
            this._moveCursor(1);
        }

        //keyword
        if (keyWords.includes(tokenValue)) return new Token(tokenType.KEYWORD, tokenLineNum, tokenCharNum, {value: tokenValue});
        
        //identifier
        return new Token(tokenType.IDENTIFIER, tokenLineNum, tokenCharNum, {value: tokenValue});
    }

    //TODO: check for browser specific whites
    _skipWhite() {
        while(isWhite(this.currentChar)) {
            if (isNewLineWin(this.currentChar + this.nextChar)) {
                this.pos += 1;
                this.charNum = 0;
                this.lineNum++;
            } else if (isNewLine(this.currentChar)) {
                this.charNum = 0;
                this.lineNum++;
            }

            this._moveCursor(1);
        }
    }

    _moveCursor(n) {
        this.pos += n;
        this.charNum += n;
        this.currentChar = this.code[this.pos];
        this.nextChar = this.code[this.pos + 1];
    }

}

function isAlpha (c) { return c.match(/[a-zA-Z]/) }
function isNumber (c) { return c.match(/[0-9]/) }
function isAlphaNum (c) {return (isAlpha(c) || isNumber(c))}
function isNewLine(c) { return (c === '\r' || c === '\n') }
function isNewLineWin(c) { return (c === '\r\n' || c === '\n\r') }
function isWhite(c) { return (c === '\r' || c === '\n' || c === ' ' || c === '\t') }
function isInt(n) { return n % 1 === 0 }