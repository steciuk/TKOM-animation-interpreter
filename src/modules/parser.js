import { tokenType } from './token.js'
import { SyntaxError } from './error-handler.js'
import { Scanner } from './scanner.js'
import { BinaryOp, UnaryOp, Int, Float, Identifier, FuncCall } from './ast-nodes.js'

export class Parser {
    constructor(code, maxIdentLen) {
        this.scanner = new Scanner(code, maxIdentLen)
        this.current_token = self.scanner.getToken()
    }

    parse(){

    }

    _eat(expected = null) {
        if(expected !== null) {
            if(expected === this.current_token.type) {
                this.current_token = this.scanner.getToken()
            } 
            else {
                this.throwSyntaxError(expected)
            }
        }
        else {
            this.current_token = this.scanner.getToken()
        }
    }

    throwSyntaxError(expected) {
        let message = '['
       (Array.isArray(expected)) ? message += expected.join(' or ') : message = expected
        message += ']'
        throw new SyntaxError(
            `${this.current_token.lineNum} : ${this.current_token.charNum} : 
            expected: ${message}, 
            got: ${this.current_token.type}`
        )
    }

    _parseArithExpression() {
        this._parseAddExpression()
    }

    _parseAddExpression() {
        this._parseMultExpression()
    }

    _parseMultExpression() {
        let token = this.current_token
        if(token.type === tokenType.MINUS) {
            this._eat(tokenType.MINUS)

            const term = this._parseTerm()
            if(!term) this.throwSyntaxError([tokenType.IDENTIFIER, tokenType.FLOAT, tokenType.INT, tokenType.PARENTHOPEN])
           
            return new UnaryOp(token, term)
        }

        return _parseTerm()
    }

    _parseTerm() {
        let token = this.current_token
        if(token.type === tokenType.FLOAT) {
            this._eat(tokenType.FLOAT)
            return new Float(token)
        }
        if(token.type === tokenType.INT) {
            this._eat(tokenType.INT)
            return new Int(token)
        }
        if(token.type === tokenType.PARENTHOPEN){
            this._eat(tokenType.PARENTHOPEN)
            let node = this._parseArithExpression()
            if(!node) this.throwSyntaxError([tokenType.MINUS, tokenType.FLOAT, tokenType.INT, tokenType.PARENTHOPEN, tokenType.IDENTIFIER])
            this._eat(tokenType.PARENTHCLOSE)
            return node
        }

        return parseVarOrAttributeOrFunCall()  
    }

    _parseVarOrAttributeOrFunCall() {
        if(this.current_token.type !== tokenType.IDENTIFIER) return null

        let token = this.current_token
        this._eat(tokenType.IDENTIFIER)

        let node = _parseFunCall(token)
        if(node) return node

        return this._parseVarOrAttribute(token)
    }


    _parseFunCall(firstToken = null) {
        if(!firstToken) {
            if(this.current_token.type !== tokenType.IDENTIFIER) return null
            firstToken = this.current_token
            this._eat(tokenType.IDENTIFIER)
        }

        this._eat(tokenType.PARENTHOPEN)
        const args = this._parseArgsAsArray()
        this._eat(tokenType.PARENTHCLOSE)
        return new FuncCall(firstToken, args)
    }

    _parseArgsAsArray() {
        let args = []

        do{
            const arg = _parseVarOrAttribute()
            if(arg) {
                args.push(arg)
            }
            else if(this.current_token.type === tokenType.FLOAT) {
                args.push(new Float(this.current_token))
                this._eat(tokenType.FLOAT)
            }
            else if(this.current_token.type === tokenType.INT) {
                args.push(new Int(this.current_token))
                this._eat(tokenType.INT)
            }
            else if(this.current_token.type !== tokenType.PARENTHCLOSE) {
                this.throwSyntaxError([tokenType.FLOAT, tokenType.INT, tokenType.IDENTIFIER])
            }       
        }while(() => {
            if(this.current_token.type === tokenType.COMMA) {
                this._eat(tokenType.COMMA)
                return true
            }
            return false
        })

        return args
    }

    _parseVarOrAttribute(firstToken = null) {
        if(!firstToken) {
            if(this.current_token.type !== tokenType.IDENTIFIER) return null
            firstToken = this.current_token
            this._eat(tokenType.IDENTIFIER)
        }

        let attributes = []
        if(this.current_token.type === this.current_token.DOT){
            this._eat(tokenType.DOT)
            attributes.push(new Identifier(this.current_token))
            this._eat(tokenType.IDENTIFIER)

            while(this.current_token.type === tokenType.DOT) {
                this._eat(tokenType.DOT)
                const token = this.current_token
                this._eat(tokenType.IDENTIFIER)
                attributes.push(new Identifier(token))           
            }
        }

        return new VarOrAttribute(firstToken, attributes)
    }
}

