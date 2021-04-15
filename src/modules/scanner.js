import { Token, tokenType, keyWords, specialChar } from './token.js';
import { SyntaxError } from './error-handler.js';
import { Reader } from './reader.js';

export class Scanner {
    constructor(code) {
        this.reader = new Reader(code)

        this.currentChar = this.reader.nextChar();
        this.lineNum = 1;
        this.charNum = 1;
        this.charNumPrevLine = 1;
    }

    getToken() {
        this._skipWhite();
        if (this.currentChar === -1) return new Token(tokenType.EOF, this.lineNum, this.charNum);
      
        let token = null;
        token = this._processComment(this.lineNum, this.charNum)
        if(token) return token;
        token = this._processIdentifierOrKeyWord(this.lineNum, this.charNum);
        if(token) return token;
        token = this._processNumber(this.lineNum, this.charNum);
        if(token) return token;
        token = this._processSpecialChar(this.lineNum, this.charNum);
        if(token) return token;

        token = new Token(tokenType.UNKNOWN, tokenLineNum, tokenCharNum, {value: this.currentChar});
        this._moveCursor();
        return token;
    }

    _processSpecialChar(lineNum, charNum) {
        if(!specialChar.includes(this.currentChar)) return null;
        
        char = this.currentChar;
        this._moveCursor()

        return new Token(specialChar[char], tokenLineNum, tokenCharNum);
    }

    _processComment(lineNum, charNum){
        if(this.currentChar !== '#') return null;
       
        let tokenValue = "";
        this._moveCursor();

        while(this.currentChar !== '#') { //TODO: throw lexical error mising '#'
            if(this.currentChar === -1) return new Token(tokenType.UNKNOWN, tokenLineNum, tokenCharNum, {value: this.tokenValue});
            tokenValue += this.currentChar;
            this._moveCursor();
        }

        this._moveCursor()
        return new Token(tokenType.COMMENT, tokenLineNum, tokenCharNum, {value: tokenValue});
    }

    _processNumber(lineNum, charNum) {
        if(!isDigit(this.currentChar)) return null;
        let numRead = 0;

        if(is0(this.currentChar)) {
            tokenValue += this.currentChar;
            this._moveCursor();
            read++;
        }

            if(isAlphaNum(this.currentChar)) {
                this._backCursor(numRead);
                return null;
            }
        
        while(isDigit(this.currentChar)) {
            tokenValue += this.currentChar;
            this._moveCursor()
            numRead++;
        }

            if(isAlpha(this.currentChar)) {
                this._backCursor(numRead);
                return null;
            }

        if(this.currentChar === '.') {
            tokenValue += '.'
            this._moveCursor()
            numRead++;
        }

            if(isAlpha(this.currentChar)) {
                this._backCursor(numRead);
                return null;
            }

        while(isDigit(this.currentChar)) {
            tokenValue += this.currentChar;
            this._moveCursor()
            numRead++;
        }

            if(isAlpha(this.currentChar)) {
                this._backCursor(numRead);
                return null;
            } 

        tokenValue = Number(tokenValue);
        return (isInt(tokenValue) ? new Token(tokenType.INT, tokenLineNum, tokenCharNum, { value: tokenValue }) : new Token(tokenType.FLOAT, tokenLineNum, tokenCharNum, { value: tokenValue }));
    }

    _processIdentifierOrKeyWord(lineNum, charNum) {
        if(!isSmallAlpha(this.currentChar)) return null;

        let maxIdentLen = 50;
        let tokenValue = "";

        while(isAlphaNum(this.currentChar) && maxIdentLen > 0) {
            tokenValue += this.currentChar;
            this._moveCursor();
            maxIdentLen--;
        }

        //keyword
        if (keyWords.includes(tokenValue)) return new Token(keyWords[tokenValue], tokenLineNum, tokenCharNum);
        
        //identifier
        return new Token(tokenType.IDENTIFIER, tokenLineNum, tokenCharNum, {value: tokenValue});
    }

    _skipWhite() {
        while(isWhite(this.currentChar)) {
            this._moveCursor();
        }
    }

    _moveCursor() {
        this.currentChar = this.reader.nextChar();
        if(isNewLine(this.currentChar)) {
            this.lineNum++;
            this.charNum = 0;
        } else {
            this.charNum++;
        }
    }

    _backCursor() {
        this.currentChar = this.reader.prevChar();
        this.charNum--;      
    }
}

function isSmallAlpha(c) {  return c.match(/[a-z]/)                         }
function isAlpha(c) {       return c.match(/[a-zA-Z]/)                      }
function is0(c) {           return c === '0'                                }
function is1_9(c) {         return c.match(/[1-9]/)                         }
function isDigit(c) {       return (is1_9(c) ||  is0(c))                    }
function isAlphaNum(c) {    return (isAlpha(c) || isDigit(c))              }
function isNewLine(c) {     return c === '\n'                               }
function isWhite(c) {       return (c === '\n' || c === ' ' || c === '\t')  }
function isInt(n) {         return n % 1 === 0                              }