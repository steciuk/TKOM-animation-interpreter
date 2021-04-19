import { Token, tokenType, keyWords, specialChar } from './token.js';
import { LexicalError } from './error-handler.js';
import { Reader } from './reader.js';

export class Scanner {
    constructor(code, maxIdentLen) {
        this.reader = new Reader(code)

        this.maxIdentLen = maxIdentLen;
        this.currentChar = this.reader.nextChar();
        this.lineNum = 1;
        this.charNum = 1;
        this.charNumPrevLine = 1;
    }

    getToken() {
        this._skipWhite();
        if (this.currentChar === '~~') return new Token(tokenType.EOF, this.lineNum, this.charNum);
      
        let lineNum = this.lineNum;
        let charNum = this.charNum;

        let token = null;
        token = this._processComment(lineNum, charNum)
        if(token) return token;
        token = this._processIdentifierOrKeyWord(lineNum, charNum);
        if(token) return token;
        token = this._processNumber(lineNum, charNum);
        if(token) return token;
        token = this._processSpecialChar(lineNum, charNum);
        if(token) return token;
        token = this._processStartingWithCapitalAlpha(lineNum, charNum);
        if(token) return token;


        token = new Token(tokenType.UNKNOWN, lineNum, charNum, {value: this.currentChar});
        this._moveCursor();
        return token;
    }

    _processComment(lineNum, charNum){
        if(this.currentChar !== '#') return null;
       
        let tokenValue = "";
        this._moveCursor();

        while(this.currentChar !== '#') {
            if(this.currentChar === -1) throw new LexicalError('Missing ending # sign', lineNum, charNum);
            tokenValue += this.currentChar;
            this._moveCursor();
        }

        this._moveCursor()
        return new Token(tokenType.COMMENT, lineNum, charNum, {value: tokenValue});
    }

    _processIdentifierOrKeyWord(lineNum, charNum) {
        if(!isSmallAlpha(this.currentChar)) return null;

        let maxIdentLen = this.maxIdentLen;
        let tokenValue = "";

        while(isAlphaNum(this.currentChar) && maxIdentLen > 0) {
            tokenValue += this.currentChar;
            this._moveCursor();
            maxIdentLen--;
        }

        // keyword
        if (keyWords.hasOwnProperty(tokenValue)) return new Token(keyWords[tokenValue], lineNum, charNum);
        
        // identifier
        return new Token(tokenType.IDENTIFIER, lineNum, charNum, {value: tokenValue});
    }

    _processNumber(lineNum, charNum) {
        if(!isDigit(this.currentChar)) return null;
        let tokenValue = '';

        // 0
        if(is0(this.currentChar)) {
            tokenValue += this.currentChar;
            this._moveCursor();

            // invalid: 0 alphanum
            if(isAlphaNum(this.currentChar)) {
                tokenValue += this.currentChar;
                this._moveCursor();

                // 0 alphaNum alphaNumOrDot+
                while(isAlphaNumOrDot(this.currentChar)) {
                    tokenValue += this.currentChar;
                    this._moveCursor();
                }

                return new Token(tokenType.UNKNOWN, lineNum, charNum, {value: tokenValue});                
            } 
        }
        // NumNonZero
        else {
            tokenValue += this.currentChar;
            this._moveCursor();

            // NumNonZero digit+
            while(isDigit(this.currentChar)) {
                tokenValue += this.currentChar;
                this._moveCursor();
            }

            // invalid: NumNonZero digit* alpha
            if(isAlpha(this.currentChar)) {
                tokenValue += this.currentChar;
                this._moveCursor();

                // NumNonZero digit* alpha alphaNumOrDot+
                while(isAlphaNumOrDot(this.currentChar)) {
                    tokenValue += this.currentChar;
                    this._moveCursor();
                }

                return new Token(tokenType.UNKNOWN, lineNum, charNum, {value: tokenValue});
            }
        }

        // Int .
        if(isDot(this.currentChar)) {
            tokenValue += this.currentChar;
            this._moveCursor();

            // Int . digit+ 
            while(isDigit(this.currentChar)) {
                tokenValue += this.currentChar;
                this._moveCursor();
            }

            // invalid: Int . digit* alphaOrDot
            if(isAlphaOrDot(this.currentChar)) {
                tokenValue += this.currentChar;
                this._moveCursor();

                // Int . digit* alphaOrDot alphaNumOrDot+
                while(isAlphaNumOrDot(this.currentChar)) {
                    tokenValue += this.currentChar;
                    this._moveCursor();
                }

                return new Token(tokenType.UNKNOWN, lineNum, charNum, {value: tokenValue});
            }               
        }

        
        tokenValue = Number(tokenValue);
        return (isInt(tokenValue) ? new Token(tokenType.INT, lineNum, charNum, { value: tokenValue }) : new Token(tokenType.FLOAT, lineNum, charNum, { value: tokenValue }));
    }

    _processSpecialChar(lineNum, charNum) {
        if(!specialChar.hasOwnProperty(this.currentChar)) return null;
        
        let char = this.currentChar;
        this._moveCursor()

        return new Token(specialChar[char], lineNum, charNum);
    }

    _processStartingWithCapitalAlpha(lineNum, charNum) {
        if(!isCapitalAlpha(this.currentChar)) return null;
        let tokenValue = '';
        while(isAlphaNum(this.currentChar)) {
            tokenValue += this.currentChar;
            this._moveCursor()
        }

        return new Token(tokenType.UNKNOWN, lineNum, charNum, {value: tokenValue});
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

    // _backCursor(n) {
    //     this.currentChar = this.reader.prevChar(n);
    //     this.charNum -= n;      
    // }
}

function isSmallAlpha(c) {  return c.match(/[a-z]/)                         }
function isCapitalAlpha(c) {return c.match(/[A-Z]/)                         }
function isAlpha(c) {       return c.match(/[a-zA-Z]/)                      }
function isDot(c) {         return c === '.'                                }
function isAlphaOrDot(c) {  return (isAlpha(c) || isDot(c))                 }

function is0(c) {           return c === '0'                                }
function is1_9(c) {         return c.match(/[1-9]/)                         }
function isDigit(c) {       return (is1_9(c) ||  is0(c))                    }
function isDigitOrDot(c) {  return (isDigit(c) || isDot(c))                 }

function isAlphaNum(c) {    return (isAlpha(c) || isDigit(c))               }
function isAlphaNumOrDot(c) {return (isAlphaNum(c) || isDot(c))}

function isNewLine(c) {     return c === '\n'                               }
function isWhite(c) {       return (c === '\n' || c === ' ' || c === '\t')  }
function isInt(n) {         return n % 1 === 0                              }