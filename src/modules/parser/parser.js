import { tokenType } from '../token.js'
import { SyntaxError } from '../error-handler.js'
import { Scanner } from '../scanner/scanner.js'
import { ForStatement, FuncDef, Var, BinaryOp, UnaryOp, Int, Float, FuncCall, VarAndAttribute, Comment, Transformation, ReturnStatement, IfStatement } from './ast-nodes.js'
import { Program } from './program.js'

export class Parser {
    constructor(code, maxIdentLen) {
        this.scanner = new Scanner(code, maxIdentLen)
        this.current_token = this.scanner.getToken()
    }

    parse(){
        let funMap = new Map()
        let instructions = []

        while(this.current_token.type !== tokenType.EOF) {
            let instruction = null
            instruction = this._parseFuncDef()
            if(instruction) {
                funMap.set(instruction.name, instruction)
            }
            else {
                instruction = this._parseCommand()
                if(instruction) instructions.push(instruction)
            }

            if(!instruction) this._throwSyntaxError("KNOWN TOKEN") // TODO: ale jaki?
        }

        return new Program(instructions, funMap)
    }

    _parseBlock() {
        this._eat(tokenType.CURLYOPEN)
        let commands = []

        while(this.current_token.type !== tokenType.CURLYCLOSE) {
            let command = null
            if(this.current_token.type === tokenType.RETURN) {
                const token = this.current_token
                this._eat(tokenType.RETURN)
                const returnVal = this._parseVarOrAttribute()
                command = new ReturnStatement(token, returnVal)
                this._eat(tokenType.SEMICOLON)
            }
            else {
                command = this._parseCommand()
            }
            if(!command) this._throwSyntaxError([tokenType.IF, tokenType.FOR, tokenType.IDENTIFIER, tokenType.COMMENT, tokenType.RETURN])
            commands.push(command)
        }

        this._eat(tokenType.CURLYCLOSE)

        return commands
    }

    _parseFuncDef() {
        if(this.current_token.type !== tokenType.FUNC) return null
        this._eat(tokenType.FUNC)
        if(this.current_token.type !== tokenType.IDENTIFIER) this._throwSyntaxError(tokenType.IDENTIFIER)
        const name = this.current_token
        this._eat(tokenType.IDENTIFIER)
        this._eat(tokenType.PARENTHOPEN)

        let params = []

        if(this.current_token.type === tokenType.IDENTIFIER) {
            let arg = this.current_token
            this._eat(tokenType.IDENTIFIER)
            params.push(new Var(arg))

            while(this.current_token.type === tokenType.COMMA && this._eat(tokenType.COMMA)) {
                let arg = this.current_token
                this._eat(tokenType.IDENTIFIER)
                params.push(new Var(arg))      
            }
        }

        this._eat(tokenType.PARENTHCLOSE)       
        const commands = this._parseBlock()
        this._eat(tokenType.SEMICOLON)
        return new FuncDef(name, params, commands)
    }

    _parseCommand() {
        if(this.current_token.type === tokenType.COMMENT) { 
            this._eat(tokenType.COMMENT)
            return new Comment(this.current_token) 
        }

        let node = this._parseExpression()
        if(!node) {
            node = this._parseFor()
            if(!node) {
                node = this._parseIf()
            } 
        } 
        
        if(node !== null) this._eat(tokenType.SEMICOLON)
        return node
    }

    _parseFor() {
        if(this.current_token.type !== tokenType.FOR) return null
        const token = this.current_token
        this._eat(tokenType.FOR)
        this._eat(tokenType.PARENTHOPEN)
        const numOfIterations = this._parseArithExpression()
        if(!numOfIterations) this._throwSyntaxError([tokenType.MINUS, tokenType.IDENTIFIER, tokenType.FLOAT, tokenType.INT, tokenType.PARENTHOPEN])
        this._eat(tokenType.PARENTHCLOSE)
        const block = this._parseBlock()
        return new ForStatement(token, numOfIterations, block)
    }

    _parseExpression() {
        if(this.current_token.type !== tokenType.IDENTIFIER) return null
        const token = this.current_token
        this._eat(tokenType.IDENTIFIER)

        let node = this._parseFunCall(token)
        if(node) { // funCall or transformation
            if(this.current_token.type !== tokenType.MULTIPLY) return node

            let transformations = []
            transformations.push(node)
            let funcName = null
            while(this.current_token.type === tokenType.MULTIPLY) {
                this._eat(tokenType.MULTIPLY)
                funcName = this.current_token
                this._eat(tokenType.IDENTIFIER)

                const func = this._parseFunCall(funcName)
                if(!func) break

                transformations.push(func)
            }

            return new Transformation(funcName, transformations)
        }
        // assignment
        else if(this.current_token.type === tokenType.ASSIGN || this.current_token.type === tokenType.DOT) {
            const left = this._parseVarOrAttribute(token)
            const operator = this.current_token
            this._eat(tokenType.ASSIGN)
            const right = this._parseArithExpression()
            if(!right) this._throwSyntaxError([tokenType.MINUS, tokenType.IDENTIFIER, tokenType.FLOAT, tokenType.INT, tokenType.PARENTHOPEN])
            return new BinaryOp(left, right, operator)
        }

        this._throwSyntaxError([tokenType.PARENTHOPEN, tokenType.DOT, tokenType.ASSIGN])
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
 
    _parseIf() {
        if(this.current_token.type !== tokenType.IF) return null
        const token = this.current_token
        this._eat(tokenType.IF)
        this._eat(tokenType.PARENTHOPEN)
        const condition = this._parseCondition()
        this._eat(tokenType.PARENTHCLOSE)
        const block = this._parseBlock()

        return new IfStatement(token, condition, block)
    }

    _parseCondition() {
        const left = this._parseAndCondition()
        if(!left) return null
        const operator = this.current_token
        while(operator.type === tokenType.OR) {
            this._eat(tokenType.OR)
            const right = this._parseCondition()
            if(!right) this._throwSyntaxError([tokenType.NOT, tokenType.IDENTIFIER, tokenType.FLOAT, tokenType.INT, tokenType.PARENTHOPEN])
            return new BinaryOp(left, right, operator)
        }

        return left
    }

    _parseAndCondition() {
        const left = this._parseEqualCondition()
        if(!left) return null
        const operator = this.current_token
        while(operator.type === tokenType.AND) {
            this._eat(tokenType.AND)
            const right = this._parseAndCondition()
            if(!right) this._throwSyntaxError([tokenType.NOT, tokenType.IDENTIFIER, tokenType.FLOAT, tokenType.INT, tokenType.PARENTHOPEN])
            return new BinaryOp(left, right, operator)
        }

        return left
    }

    _parseEqualCondition() {
        const left = this._parseRelationCondition()
        if(!left) return null
        const operator = this.current_token
        if(operator.type === tokenType.EQUALS || operator.type === tokenType.NOTEQUALS) {
            this._eat()
            const right = this._parseRelationCondition()
            if(!right) this._throwSyntaxError([tokenType.NOT, tokenType.IDENTIFIER, tokenType.FLOAT, tokenType.INT, tokenType.PARENTHOPEN])
            return new BinaryOp(left, right, operator)
        }

        return left
    }

    _parseRelationCondition() {
        const left = this._parseNegationCondition()
        if(!left) return null
        const operator = this.current_token
        if(operator.type === tokenType.LESS || 
            operator.type === tokenType.GREATER || 
            operator.type === tokenType.LESSOREQUALS ||
            operator.type === tokenType.GREATEROREQUALS) {
            
            this._eat()
            const right = this._parseNegationCondition()
            if(!right) this._throwSyntaxError([tokenType.NOT, tokenType.IDENTIFIER, tokenType.FLOAT, tokenType.INT, tokenType.PARENTHOPEN])
            return new BinaryOp(left, right, operator)
        }

        return left
    }

    _parseNegationCondition() {
        let token = this.current_token
        if(token.type === tokenType.NOT) {
            this._eat(tokenType.NOT)

            const term = this._parseBaseCondition()
            if(!right) this._throwSyntaxError([tokenType.IDENTIFIER, tokenType.FLOAT, tokenType.INT, tokenType.PARENTHOPEN])
           
            return new UnaryOp(token, term)
        }

        return this._parseBaseCondition()
    }

    _parseBaseCondition() {
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
            let node = this._parseCondition()
            if(!right) this._throwSyntaxError([tokenType.NOT, tokenType.IDENTIFIER, tokenType.FLOAT, tokenType.INT, tokenType.PARENTHOPEN])
            this._eat(tokenType.PARENTHCLOSE)
            return node
        }

        return this._parseVarOrAttributeOrFunCall()  
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
        else if(this.current_token.type !== tokenType.PARENTHOPEN) return null

        this._eat(tokenType.PARENTHOPEN)
        const args = this._parseArgsAsArray()
        this._eat(tokenType.PARENTHCLOSE)
        return new FuncCall(firstToken, args)
    }

    _parseArgsAsArray() {
        let args = []

        do{
            if(this.current_token.type === tokenType.COMMA) this._throwSyntaxError([tokenType.FLOAT, tokenType.INT, tokenType.IDENTIFIER])
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
        
        if(this.current_token.type === tokenType.DOT) {
            let attributes = []
            while(this.current_token.type === tokenType.DOT) {
                this._eat(tokenType.DOT)
                const token = this.current_token
                this._eat(tokenType.IDENTIFIER)
                attributes.push(token.value)           
            }
    
            return new VarAndAttribute(firstToken, attributes)
        } else {
            return new Var(firstToken)
        }

    }

    _eat(expected = null) {
        if(expected !== null) {
            if(expected === this.current_token.type) {
                this.current_token = this.scanner.getToken()
                return true
            } 
            else {
                this._throwSyntaxError(expected)
            }
        }
        else {
            this.current_token = this.scanner.getToken()
            return true
        }
    }
}

