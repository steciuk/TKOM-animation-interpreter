import { tokenType } from './token.js'
import { SyntaxError } from './error-handler.js'
import { Scanner } from './scanner.js'
import { BinaryOp, UnaryOp, Int, Float, Identifier, FuncCall, VarOrAttribute, Comment } from './ast-nodes.js'

export class Parser {
    constructor(code, maxIdentLen) {
        this.scanner = new Scanner(code, maxIdentLen)
        this.current_token = this.scanner.getToken()
    }

    parse(){
        let instructions = []
        while(this.current_token.type !== tokenType.EOF){
            const instruction = this._parseProgram()
            if(!instruction) this._throwSyntaxError("KNOWN TOKEN")
            instruction.push(instruction)
        }
        
        return instructions
    }

    _parseProgram() {
        let node = this._parseCommand()
        if(node) return node
        node = this._parseFuncDef()
        return node
        //
    }

    _parseCommand() {
        if(token.type === tokenType.COMMENT) { 
            this._eat(tokenType.COMMENT)
            return new Comment(this.current_token) 
        }

        let node = this._parseExpression()
        if(node) return node
        node = this._parseFor()
        if(node) return node
        node = this._parseIf()
        
        this._eat(tokenType.SEMICOLON)
        return node
    }

    _throwSyntaxError(expected) {
        let message = '['
        Array.isArray(expected) ? message += expected.join(' or ') : message += expected
        message += ']'
        throw new SyntaxError(
            `${this.current_token.lineNum} : ${this.current_token.charNum} : 
            expected: ${message}, 
            got: ${this.current_token.type}`
        )
    }

    _parseArithExpression() {
        const left = this._parseAddExpression()
        if(!left) return null
        const operator = this.current_token
        while(operator.type === tokenType.MINUS || operator.type === tokenType.PLUS) {
            this._eat()
            const right = this._parseArithExpression()
            if(!right) this._throwSyntaxError([tokenType.MINUS, tokenType.IDENTIFIER, tokenType.FLOAT, tokenType.INT, tokenType.PARENTHOPEN])
            return new BinaryOp(left, right, operator)
        }

        return left
    }

    _parseAddExpression() {
        const left = this._parseMultExpression()
        if(!left) return null
        const operator = this.current_token
        while(operator.type === tokenType.DIVIDE || operator.type === tokenType.MULTIPLY) {
            this._eat()
            const right = this._parseAddExpression()
            if(!right) this._throwSyntaxError([tokenType.MINUS, tokenType.IDENTIFIER, tokenType.FLOAT, tokenType.INT, tokenType.PARENTHOPEN])
            return new BinaryOp(left, right, operator)
        }

        return left
    }

    _parseMultExpression() {
        let token = this.current_token
        if(token.type === tokenType.MINUS) {
            this._eat(tokenType.MINUS)

            const term = this._parseTerm()
            if(!term) this._throwSyntaxError([tokenType.IDENTIFIER, tokenType.FLOAT, tokenType.INT, tokenType.PARENTHOPEN])
           
            return new UnaryOp(token, term)
        }

        return this._parseTerm()
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
            if(!node) this._throwSyntaxError([tokenType.MINUS, tokenType.FLOAT, tokenType.INT, tokenType.PARENTHOPEN, tokenType.IDENTIFIER])
            this._eat(tokenType.PARENTHCLOSE)
            return node
        }

        return this._parseVarOrAttributeOrFunCall()  
    }

    _parseVarOrAttributeOrFunCall() {
        if(this.current_token.type !== tokenType.IDENTIFIER) return null

        let token = this.current_token
        this._eat(tokenType.IDENTIFIER)

        let node = this._parseFunCall(token)
        if(node) return node

        return this._parseVarOrAttribute(token)
    }


    _parseFunCall(firstToken = null) {
        if(!firstToken) {
            if(this.current_token.type !== tokenType.IDENTIFIER) return null
            firstToken = this.current_token
            this._eat(tokenType.IDENTIFIER)
        }

        if(this.current_token.type !== tokenType.PARENTHOPEN) return null

        this._eat(tokenType.PARENTHOPEN)
        const args = this._parseArgsAsArray()
        this._eat(tokenType.PARENTHCLOSE)
        return new FuncCall(firstToken, args)
    }

    _parseArgsAsArray() {
        let args = []

        do{
            const arg = this._parseVarOrAttribute()
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
                this._throwSyntaxError([tokenType.FLOAT, tokenType.INT, tokenType.IDENTIFIER])
            }       
        }while(this.current_token.type === tokenType.COMMA && this._eat(tokenType.COMMA))

        return args
    }

    _parseVarOrAttribute(firstToken = null) {
        if(!firstToken) {
            if(this.current_token.type !== tokenType.IDENTIFIER) return null
            firstToken = this.current_token
            this._eat(tokenType.IDENTIFIER)
        }

        let attributes = []
        if(this.current_token.type === tokenType.DOT){
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

    _eat(expected = null) {
        if(expected !== null) {
            if(expected === this.current_token.type) {
                this.current_token = this.scanner.getToken()
                return true
            } 
            else {
                this.throwSyntaxError(expected)
            }
        }
        else {
            this.current_token = this.scanner.getToken()
            return true
        }
    }
}

