export class Numeric {
    constructor(value) {
        value = value;
    }
}

export class Int extends Numeric {
    constructor(value) {
        super(value);
    }
}

export class Float extends Numeric {
    constructor(value) {
        super(value);
    }
}

export const execNodes = {
    Int: Int,
    Float: Float,
    Numeric: Numeric,
};
