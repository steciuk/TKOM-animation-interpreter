import { tokenType } from '../token.js';
import { SyntaxError } from '../error-handler.js';
import { Scanner } from '../scanner/scanner.js';
import {
    ForStatement,
    FuncDef,
    Var,
    BinaryOp,
    UnaryOp,
    Int,
    Float,
    FuncCall,
    VarAndAttribute,
    Comment,
    Transformation,
    ReturnStatement,
    IfStatement,
    Assignment,
} from './ast-nodes.js';
import { Program } from './program.js';

export class Parser {
    constructor(code, maxIdentLen) {
        this.scanner = new Scanner(code, maxIdentLen);
        this.current_token = this.scanner.getToken();
    }

    parse() {
        let funMap = {};
        let instructions = [];
        let instruction = null;

        do {
            instruction = null;
            instruction = this._parseFuncDef();
            if (instruction) {
                funMap[instruction.sym] = instruction;
            } else {
                instruction = this._parseCommand();
                if (instruction) instructions.push(instruction);
            }
        } while (instruction);

        if (this.current_token.type !== tokenType.EOF)
            this._throwSyntaxError('KNOWN TOKEN'); // TODO: ale jaki?
        return new Program(instructions, funMap);
    }

    _parseFuncDef() {
        if (!this._eatOnlyIfIs(tokenType.FUNC)) return null;

        const name = this.current_token;
        this._eat(tokenType.IDENTIFIER);
        this._eat(tokenType.PARENTHOPEN);

        let params = [];

        if (this.current_token.type === tokenType.IDENTIFIER) {
            let arg = this.current_token;
            this._eat(tokenType.IDENTIFIER);
            params.push(new Var(arg));

            while (this._eatOnlyIfIs(tokenType.COMMA)) {
                let arg = this.current_token;
                this._eat(tokenType.IDENTIFIER);
                params.push(new Var(arg));
            }
        }

        this._eat(tokenType.PARENTHCLOSE);
        const commands = this._parseBlock();
        this._eat(tokenType.SEMICOLON);
        return new FuncDef(name, params, commands);
    }

    _parseBlock() {
        this._eat(tokenType.CURLYOPEN);
        let commands = [];
        let command = null;

        do {
            command = null;
            command = this._parseCommand();
            if (command) commands.push(command);
        } while (command);

        this._eat(tokenType.CURLYCLOSE);

        return commands;
    }

    _parseReturn() {
        const token = this.current_token;
        if (!this._eatOnlyIfIs(tokenType.RETURN)) return null;
        const returnVal = this._parseArithExpression();
        return new ReturnStatement(token, returnVal);
    }

    _parseCommand() {
        if (this._eatOnlyIfIs(tokenType.COMMENT))
            return new Comment(this.current_token);

        let node = this._parseExpression();
        if (!node) {
            node = this._parseFor();
            if (!node) {
                node = this._parseIf();
                if (!node) {
                    node = this._parseReturn();
                }
            }
        }

        if (node !== null) this._eat(tokenType.SEMICOLON);
        return node;
    }

    _parseFor() {
        const token = this.current_token;
        if (!this._eatOnlyIfIs(tokenType.FOR)) return null;

        this._eat(tokenType.PARENTHOPEN);
        const numOfIterations = this._parseArithExpression();
        if (!numOfIterations)
            this._throwSyntaxError([
                tokenType.MINUS,
                tokenType.IDENTIFIER,
                tokenType.FLOAT,
                tokenType.INT,
                tokenType.PARENTHOPEN,
            ]);
        this._eat(tokenType.PARENTHCLOSE);
        const block = this._parseBlock();
        return new ForStatement(token, numOfIterations, block);
    }

    _parseIf() {
        const token = this.current_token;
        if (!this._eatOnlyIfIs(tokenType.IF)) return null;

        this._eat(tokenType.PARENTHOPEN);
        const condition = this._parseCondition();
        this._eat(tokenType.PARENTHCLOSE);
        const ifBlock = this._parseBlock();

        let elseBlock = null;
        if (this._eatOnlyIfIs(tokenType.ELSE, this.current_token))
            elseBlock = this._parseBlock();

        return new IfStatement(token, condition, ifBlock, elseBlock);
    }

    _parseCondition() {
        let left = this._parseAndCondition();
        if (!left)
            this._throwSyntaxError([
                tokenType.NOT,
                tokenType.IDENTIFIER,
                tokenType.FLOAT,
                tokenType.INT,
                tokenType.PARENTHOPEN,
            ]);
        let operator = this.current_token;
        while (this._eatOnlyIfIs(tokenType.OR)) {
            const right = this._parseAndCondition();
            if (!right)
                this._throwSyntaxError([
                    tokenType.NOT,
                    tokenType.IDENTIFIER,
                    tokenType.FLOAT,
                    tokenType.INT,
                    tokenType.PARENTHOPEN,
                ]);
            left = new BinaryOp(left, right, operator);
            operator = this.current_token;
        }

        return left;
    }

    _parseAndCondition() {
        let left = this._parseEqualCondition();
        if (!left) return null;
        let operator = this.current_token;
        while (this._eatOnlyIfIs(tokenType.AND)) {
            const right = this._parseEqualCondition();
            if (!right)
                this._throwSyntaxError([
                    tokenType.NOT,
                    tokenType.IDENTIFIER,
                    tokenType.FLOAT,
                    tokenType.INT,
                    tokenType.PARENTHOPEN,
                ]);
            left = new BinaryOp(left, right, operator);
            operator = this.current_token;
        }

        return left;
    }

    _parseEqualCondition() {
        const left = this._parseRelationCondition();
        if (!left) return null;
        const operator = this.current_token;
        if (
            operator.type === tokenType.EQUALS ||
            operator.type === tokenType.NOTEQUALS
        ) {
            this._eat();
            const right = this._parseRelationCondition();
            if (!right)
                this._throwSyntaxError([
                    tokenType.NOT,
                    tokenType.IDENTIFIER,
                    tokenType.FLOAT,
                    tokenType.INT,
                    tokenType.PARENTHOPEN,
                ]);
            return new BinaryOp(left, right, operator);
        }

        return left;
    }

    _parseRelationCondition() {
        const left = this._parseNegationCondition();
        if (!left) return null;
        const operator = this.current_token;
        if (
            operator.type === tokenType.LESS ||
            operator.type === tokenType.GREATER ||
            operator.type === tokenType.LESSOREQUALS ||
            operator.type === tokenType.GREATEROREQUALS
        ) {
            this._eat();
            const right = this._parseNegationCondition();
            if (!right)
                this._throwSyntaxError([
                    tokenType.NOT,
                    tokenType.IDENTIFIER,
                    tokenType.FLOAT,
                    tokenType.INT,
                    tokenType.PARENTHOPEN,
                ]);
            return new BinaryOp(left, right, operator);
        }

        return left;
    }

    _parseNegationCondition() {
        let token = this.current_token;
        if (this._eatOnlyIfIs(tokenType.NOT)) {
            const term = this._parseBaseCondition();
            if (!right)
                this._throwSyntaxError([
                    tokenType.IDENTIFIER,
                    tokenType.FLOAT,
                    tokenType.INT,
                    tokenType.PARENTHOPEN,
                ]);

            return new UnaryOp(token, term);
        }

        return this._parseBaseCondition();
    }

    _parseBaseCondition() {
        let token = this.current_token;

        // if (this._eatOnlyIfIs(tokenType.PARENTHOPEN)) { //TODO: w nawiasach tylko arytmetyczne
        //     let node = this._parseCondition();
        //     if (!right)
        //         this._throwSyntaxError([
        //             tokenType.NOT,
        //             tokenType.IDENTIFIER,
        //             tokenType.FLOAT,
        //             tokenType.INT,
        //             tokenType.PARENTHOPEN,
        //         ]);
        //     this._eat(tokenType.PARENTHCLOSE);
        //     return node;
        // }

        return this._parseArithExpression();
    }

    _parseExpression() {
        const token = this.current_token;
        if (!this._eatOnlyIfIs(tokenType.IDENTIFIER)) return null;

        let node = this._parseFunCall(token);
        if (node) {
            // funCall or transformation
            if (this.current_token.type !== tokenType.MULTIPLY) return node;

            let transformations = [];
            transformations.push(node);
            let funcName = null;
            while (this._eatOnlyIfIs(tokenType.MULTIPLY)) {
                funcName = this.current_token;
                this._eat(tokenType.IDENTIFIER);

                const func = this._parseFunCall(funcName);
                if (!func) break;

                transformations.push(func);
            }

            return new Transformation(funcName, transformations);
        }
        // assignment
        else if (
            this.current_token.type === tokenType.ASSIGN ||
            this.current_token.type === tokenType.DOT
        ) {
            const left = this._parseVarOrAttribute(token);
            const operator = this.current_token;
            this._eat(tokenType.ASSIGN);
            const right = this._parseArithExpression();
            if (!right)
                this._throwSyntaxError([
                    tokenType.MINUS,
                    tokenType.IDENTIFIER,
                    tokenType.FLOAT,
                    tokenType.INT,
                    tokenType.PARENTHOPEN,
                ]);
            return new Assignment(left, right, operator);
        }

        this._throwSyntaxError([
            tokenType.PARENTHOPEN,
            tokenType.DOT,
            tokenType.ASSIGN,
        ]);
    }

    _parseArithExpression() {
        let left = this._parseAddExpression();
        if (!left) return null;
        let operator = this.current_token;
        while (
            operator.type === tokenType.MINUS ||
            operator.type === tokenType.PLUS
        ) {
            this._eat();
            const right = this._parseAddExpression();
            if (!right)
                this._throwSyntaxError([
                    tokenType.MINUS,
                    tokenType.IDENTIFIER,
                    tokenType.FLOAT,
                    tokenType.INT,
                    tokenType.PARENTHOPEN,
                ]);
            left = new BinaryOp(left, right, operator);
            operator = this.current_token;
        }

        return left;
    }

    _parseAddExpression() {
        let left = this._parseMultExpression();
        if (!left) return null;
        let operator = this.current_token;
        while (
            operator.type === tokenType.DIVIDE ||
            operator.type === tokenType.MULTIPLY
        ) {
            this._eat();
            const right = this._parseMultExpression();
            if (!right)
                this._throwSyntaxError([
                    tokenType.MINUS,
                    tokenType.IDENTIFIER,
                    tokenType.FLOAT,
                    tokenType.INT,
                    tokenType.PARENTHOPEN,
                ]);
            left = new BinaryOp(left, right, operator);
            operator = this.current_token;
        }

        return left;
    }

    _parseMultExpression() {
        let token = this.current_token;
        if (this._eatOnlyIfIs(tokenType.MINUS)) {
            const term = this._parseTerm();
            if (!term)
                this._throwSyntaxError([
                    tokenType.IDENTIFIER,
                    tokenType.FLOAT,
                    tokenType.INT,
                    tokenType.PARENTHOPEN,
                ]);

            return new UnaryOp(token, term);
        }

        return this._parseTerm();
    }

    _parseTerm() {
        let token = this.current_token;
        if (this._eatOnlyIfIs(tokenType.FLOAT, token)) return new Float(token);
        if (this._eatOnlyIfIs(tokenType.INT, token)) return new Int(token);
        if (this._eatOnlyIfIs(tokenType.PARENTHOPEN, token)) {
            let node = this._parseArithExpression();
            if (!node)
                this._throwSyntaxError([
                    tokenType.MINUS,
                    tokenType.FLOAT,
                    tokenType.INT,
                    tokenType.PARENTHOPEN,
                    tokenType.IDENTIFIER,
                ]);
            this._eat(tokenType.PARENTHCLOSE);
            return node;
        }

        return this._parseVarOrAttributeOrFunCall();
    }

    _parseVarOrAttributeOrFunCall() {
        const token = this.current_token;
        if (!this._eatOnlyIfIs(tokenType.IDENTIFIER)) return null;

        let node = this._parseFunCall(token);
        if (node) return node;

        return this._parseVarOrAttribute(token);
    }

    _parseFunCall(firstToken = null) {
        if (!firstToken) {
            firstToken = this.current_token;
            if (!this._eatOnlyIfIs(tokenType.IDENTIFIER)) return null;
            this._eat(tokenType.PARENTHOPEN);
        } else if (!this._eatOnlyIfIs(tokenType.PARENTHOPEN)) return null;
        const args = this._parseArgsAsArray();
        this._eat(tokenType.PARENTHCLOSE);
        return new FuncCall(firstToken, args);
    }

    _parseArgsAsArray() {
        let args = [];

        do {
            if (this.current_token.type === tokenType.COMMA)
                this._throwSyntaxError([
                    tokenType.FLOAT,
                    tokenType.INT,
                    tokenType.IDENTIFIER,
                    tokenType.MINUS,
                ]);
            const token = this.current_token;
            const arg = this._parseArithExpression();
            if (arg) args.push(arg);
            else if (this.current_token.type !== tokenType.PARENTHCLOSE)
                this._throwSyntaxError([
                    tokenType.FLOAT,
                    tokenType.INT,
                    tokenType.IDENTIFIER,
                    tokenType.MINUS,
                ]);
        } while (this._eatOnlyIfIs(tokenType.COMMA));

        return args;
    }

    _parseVarOrAttribute(firstToken = null) {
        if (!firstToken) {
            firstToken = this.current_token;
            if (!this._eatOnlyIfIs(tokenType.IDENTIFIER)) return null;
        }

        if (this.current_token.type === tokenType.DOT) {
            let attributes = [];
            while (this._eatOnlyIfIs(tokenType.DOT)) {
                const token = this.current_token;
                this._eat(tokenType.IDENTIFIER);
                attributes.push(token.value);
            }

            return new VarAndAttribute(firstToken, attributes);
        } else {
            return new Var(firstToken);
        }
    }

    _eat(expected = null) {
        if (expected !== null) {
            if (expected === this.current_token.type) {
                this.current_token = this.scanner.getToken();
                return true;
            } else {
                this._throwSyntaxError(expected);
            }
        } else {
            this.current_token = this.scanner.getToken();
            return true;
        }
    }

    _eatOnlyIfIs(expected, token = null) {
        if (!token) token = this.current_token;
        if (token.type === expected) {
            this._eat();
            return true;
        }

        return false;
    }

    _throwSyntaxError(expected) {
        let message = '[';
        Array.isArray(expected)
            ? (message += expected.join(' or '))
            : (message += expected);
        message += ']';
        throw new SyntaxError(
            `${this.current_token.lineNum} : ${this.current_token.charNum} : 
            expected: ${message}, 
            got: ${this.current_token.type}`
        );
    }
}
