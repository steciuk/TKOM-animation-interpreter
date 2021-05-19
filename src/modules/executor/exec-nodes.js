export class Variable {
    constructor(value) {
        value = value;
    }
}

export class Numeric {
    constructor(value) {
        //super(value);
    }
}

export const execNodes = {
    Numeric: Numeric,
    Variable: Variable,
};
