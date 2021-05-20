import { utils } from './utils.js';

export class Point {
    #x;
    #y;

    constructor(args) {
        const expected = [Number, Number];
        utils.checkArgsStrict(args, expected);
        this.#x = args[0];
        this.#y = args[1];
    }

    x(arg) {
        if (arg === 'get') return this.#x;
        utils.isObjOfClassStrict(arg, Number);
        this.#x = arg;
    }

    y(arg) {
        if (arg === 'get') return this.#y;
        utils.isObjOfClassStrict(arg, Number);
        this.#y = arg;
    }
}

export class Color {
    #r;
    #g;
    #b;
    constructor(args) {
        const expected = [Number, Number, Number];
        utils.checkArgsStrict(args, expected);
        for (const arg of args) {
            utils.isIntStrict(arg);
            utils.isArgInLimitsStrict(0, 255, arg);
        }
        this.#r = args[0];
        this.#g = args[1];
        this.#b = args[2];
    }

    r(arg) {
        if (arg === 'get') return this.#r;
        utils.isObjOfClassStrict(arg, Number);
        utils.isArgInLimitsStrict(0, 255, arg);
        this.#r = arg;
    }

    g(arg) {
        if (arg === 'get') return this.#g;
        utils.isObjOfClassStrict(arg, Number);
        utils.isArgInLimitsStrict(0, 255, arg);
        this.#g = arg;
    }

    b(arg) {
        if (arg === 'get') return this.#b;
        utils.isObjOfClassStrict(arg, Number);
        utils.isArgInLimitsStrict(0, 255, arg);
        this.#b = arg;
    }
}

export class Shape {
    #color;
    constructor(color) {
        this.#color = color;
    }

    color(arg) {
        if (arg === 'get') return this.#color;
        utils.isObjOfClassStrict(arg, Color);
        this.#color = arg;
    }
}

export class Circle extends Shape {
    #point;
    #r;
    constructor(args) {
        const expected = [Point, Number, Color];
        utils.checkArgsStrict(args, expected);
        super(args[2]);
        this.#point = args[0];
        this.#r = args[1];
    }

    point(arg) {
        if (arg === 'get') return this.#point;
        utils.isObjOfClassStrict(arg, Point);
        this.#point = arg;
    }

    r(arg) {
        if (arg === 'get') return this.#r;
        utils.isObjOfClassStrict(arg, Number);
        this.#r = arg;
    }
}

export class Polygon extends Shape {
    constructor(points, color) {
        super(color);
        this.points = points;
    }
}

export class Rectangle extends Shape {
    constructor(point, width, height, color) {
        super(color);
        this.points = this._calcPoints(point, width, height);
        this.widthVal = width;
        this.heightVal = height;
        this.pointVal = point;
    }

    point(arg) {
        const expected = [Point];
        utils.checkArgsStrict(arg, expected);
        this.pointVal = arg;
        this.points = this._calcPoints(arg, this.widthVal, this.heightVal);
    }

    width(arg) {
        const expected = [Number];
        utils.checkArgsStrict(arg, expected);
        this.widthVal = arg;
        this.points = this._calcPoints(this.pointVal, arg, this.heightVal);
    }

    height(arg) {
        const expected = [Number];
        utils.checkArgsStrict(arg, expected);
        this.heightVal = arg;
        this.points = this._calcPoints(this.pointVal, arg, this.heightVal);
    }

    _calcPoints(point, width, height) {
        let points = [];
        points.push(point);
        points.push(new Point(point.x, point.y + height));
        points.push(new Point(point.x + width, point.y + height));
        points.push(new Point(point.x + width, point.y));
        return points;
    }
}

export const stdLib = {
    circle: (args) => new Circle(args),
    p: (args) => new Point(args),
    rgb: (args) => new Color(args),
    // polygon: polygon,
    // rectangle: rectangle,
};
