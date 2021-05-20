import { Point, Color, Polygon, Circle, Rectangle } from './objects.js';
import { utils } from './utils.js';

function point(args) {
    const expected = [Number, Number];
    utils.checkArgsStrict(args, expected);
    return new Point(args[0], args[1]);
}

function circle(args) {
    const expected = [Point, Number, Color];
    utils.checkArgsStrict(args, expected);
    return new Circle(args[0], args[1], args[2]);
}

function polygon(args) {
    if (args.length < 3) utils.throwWrongArgsNum('>=3', args.length);
    let argsList = [...args];
    const col = argsList.pop();
    for (const arg of args) utils.isObjOfClassStrict(arg, Point);
    utils.isObjOfClassStrict(col, Color);
    return new Polygon(argsList, col);
}

function rectangle(args) {
    const expected = [Point, Number, Number, Color];
    utils.checkArgsStrict(args, expected);
    return new Rectangle(args[0], args[1], args[2], args[3]);
}

function color(args) {
    const expected = [Number, Number, Number];
    const min = 0;
    const max = 255;
    utils.checkArgsStrict(args, expected);
    for (const arg of args) {
        utils.isIntStrict(arg);
        utils.isArgInLimitsStrict(min, max, arg);
    }
    return new Color(args[0], args[1], args[2]);
}

export const stdLib = {
    circle: circle,
    p: point,
    rgb: color,
    polygon: polygon,
    rectangle: rectangle,
};
