import { tokenType } from './token.js'
import { SyntaxError } from './error-handler.js'
import { Scanner } from './scanner.js'
import { BinaryOp, UnaryOp, Int, Float } from './ast-nodes.js'

export class Parser {
    constructor(code, maxIdentLen) {
        this.scanner = new Scanner(code, maxIdentLen)
        this.current_token = self.scanner.getToken()
    }

    parse(){

    }

    _eat(tokenType) {
        if(this.current_token.tokenType === tokenType) {
            this.current_token = this.scanner.getToken()
        } 
        else {
            throw new SyntaxError(
                    `${this.current_token.lineNum} : ${this.current_token.charNum} : 
                    unexpected token: ${this.current_token.tokenType}`
                )
        }
    }

    _parseArithExpression() {
        this._parseAddExpression()
    }

    _parseAddExpression() {
        this._parseMultExpression()
    }

    _parseMultExpression() {
        let token = this.current_token
        if(token.tokenType === tokenType.MINUS) {
            this._eat(tokenType.MINUS)
            return new UnaryOp(token, this._parseTerm())
        }

        return _parseTerm()
    }

    _parseTerm() {
        let node = null
        node = this._parseVarOrAttribute()
        if(node) return node
        node = this._parseFunCall()
        if(node) return node
        node = this._parseNumber()
        if(node) return node

        this._eat(tokenType.PARENTHOPEN)
        node = this._parseArithExpression()
        this._eat(tokenType.PARENTHCLOSE)

        return node
    }

    _parseNumber() {
        let token = this.current_token
        if(token.tokenType === tokenType.INT) {
            this._eat(tokenType.INT)
            return new Int(token)
        }
        if(token.tokenType === tokenType.FLOAT) {
            this._eat(tokenType.FLOAT)
            return new Float(token)
        }

        return null
    }

    // _parseVarOrAttribute() {
    //     let token = this.current_token
    //     if(token.tokenType === tokenType.IDENTIFIER) {
    //         this._eat(tokenType.IDENTIFIER)
    //     }

    //     return null         
    // }
}

