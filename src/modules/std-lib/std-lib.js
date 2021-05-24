import { utils } from './utils.js';

class Point {
    _x;
    _y;

    constructor(args) {
        const expected = [Number, Number];
        utils.checkArgsStrict(args, expected);
        this._x = args[0];
        this._y = args[1];
    }

    x(arg) {
        if (arg === 'get') return this._x;
        utils.isObjOfClassStrict(arg, Number);
        this._x = arg;
    }

    y(arg) {
        if (arg === 'get') return this._y;
        utils.isObjOfClassStrict(arg, Number);
        this._y = arg;
    }
}

class Color {
    _r;
    _g;
    _b;
    constructor(args) {
        const expected = [Number, Number, Number];
        utils.checkArgsStrict(args, expected);
        for (const arg of args) {
            utils.isIntStrict(arg);
            utils.isArgInLimitsStrict(0, 255, arg);
        }
        this._r = args[0];
        this._g = args[1];
        this._b = args[2];
    }

    r(arg) {
        if (arg === 'get') return this._r;
        utils.isObjOfClassStrict(arg, Number);
        utils.isArgInLimitsStrict(0, 255, arg);
        this._r = arg;
    }

    g(arg) {
        if (arg === 'get') return this._g;
        utils.isObjOfClassStrict(arg, Number);
        utils.isArgInLimitsStrict(0, 255, arg);
        this._g = arg;
    }

    b(arg) {
        if (arg === 'get') return this._b;
        utils.isObjOfClassStrict(arg, Number);
        utils.isArgInLimitsStrict(0, 255, arg);
        this._b = arg;
    }
}

class Transformable {
    constructor() {}
}

class Shape extends Transformable {
    _color;
    constructor(color) {
        super();
        this._color = color;
    }

    color(arg) {
        if (arg === 'get') return this._color;
        utils.isObjOfClassStrict(arg, Color);
        this._color = arg;
    }
}

class Circle extends Shape {
    _point;
    _r;
    constructor(args) {
        const expected = [Point, Number, Color];
        utils.checkArgsStrict(args, expected);
        utils.isArgInLimitsStrict(0, Infinity, args[1]);
        super(args[2]);
        this._point = args[0];
        this._r = args[1];
    }

    point(arg) {
        if (arg === 'get') return this._point;
        utils.isObjOfClassStrict(arg, Point);
        this._point = arg;
    }

    r(arg) {
        if (arg === 'get') return this._r;
        utils.isObjOfClassStrict(arg, Number);
        this._r = arg;
    }
}

class Polygon extends Shape {
    _points;
    constructor(args) {
        if (args.length < 3) utils.throwWrongArgsNum('>=3', args.length);
        let argsList = [...args];
        const col = argsList.pop();
        for (const arg of argsList) utils.isObjOfClassStrict(arg, Point);
        utils.isObjOfClassStrict(col, Color);
        super(col);
        this._points = argsList;
    }
}

class Group extends Transformable {
    _shapes;
    constructor(args) {
        super();
        if (args.length < 1) utils.throwWrongArgsNum('>=1', args.length);
        for (const arg of args)
            utils.isObjChildOfClassStrict(arg, Transformable);
        this._shapes = args;
    }
}

class Rectangle extends Polygon {
    _point;
    _width;
    _height;
    constructor(args) {
        const expected = [Point, Number, Number, Color];
        utils.checkArgsStrict(args, expected);
        utils.isArgInLimitsStrict(0, Infinity, args[1]);
        utils.isArgInLimitsStrict(0, Infinity, args[2]);
        let polyArgs = calcPoints(args[0], args[1], args[2]);
        polyArgs.push(args[3]);
        super(polyArgs);
        this._point = args[0];
        this._width = args[1];
        this._height = args[2];
    }

    point(arg) {
        if (arg === 'get') return this._point;
        utils.isObjOfClassStrict(arg, Point);
        this._point = arg;
        this._updatePoints();
    }

    width(arg) {
        if (arg === 'get') return this._width;
        utils.isObjOfClassStrict(arg, Number);
        utils.isArgInLimitsStrict(0, Infinity, arg);
        this._width = arg;
        this._updatePoints();
    }

    height(arg) {
        if (arg === 'get') return this._height;
        utils.isObjOfClassStrict(arg, Number);
        utils.isArgInLimitsStrict(0, Infinity, arg);
        this._height = arg;
        this._updatePoints();
    }

    _updatePoints() {
        super._points = calcPoints(this._point, this._width, this._height);
    }
}

function calcPoints(point, width, height) {
    let points = [];
    points.push(point);
    points.push(
        new Point([
            point.x.call(point, 'get'),
            point.y.call(point, 'get') + height,
        ])
    );
    points.push(
        new Point([
            point.x.call(point, 'get') + width,
            point.y.call(point, 'get') + height,
        ])
    );
    points.push(
        new Point([
            point.x.call(point, 'get') + width,
            point.y.call(point, 'get'),
        ])
    );
    return points;
}

function createCanvas(args) {
    const expected = [Number, Number];
    utils.checkArgsStrict(args, expected);
    const container = document.getElementById('container');

    const canvas = document.getElementById('canvas');
    if (canvas) canvas.remove();

    let newCanvas = document.createElement('canvas');
    newCanvas.setAttribute('width', args[0]);
    newCanvas.setAttribute('height', args[1]);
    newCanvas.id = 'canvas';
    container.appendChild(newCanvas);
}

function draw(args) {
    for (const arg of args) utils.isObjChildOfClassStrict(arg, Transformable);
    const canvas = document.getElementById('canvas');
    if (!canvas) utils.throwNoCanvas();
    if (canvas.getContext) {
        const ctx = canvas.getContext('2d');
        drawObjects(ctx, args);
    }

    function createRgb(color) {
        return `rgb(${color._r}, ${color._g}, ${color._b})`;
    }

    function drawPolygon(ctx, obj) {
        window.requestAnimationFrame(() => {
            ctx.beginPath();
            ctx.moveTo(obj._points[0]._x, obj._points[0]._y);
            for (let i = 1; i < obj._points.length; i++)
                ctx.lineTo(obj._points[i]._x, obj._points[i]._y);
            ctx.fillStyle = createRgb(obj._color);
            ctx.fill();
        });
    }

    function drawCircle(ctx, obj) {
        window.requestAnimationFrame(() => {
            ctx.beginPath();
            ctx.arc(obj._point._x, obj._point._y, obj._r, 0, Math.PI * 2);
            ctx.fillStyle = createRgb(obj._color);
            ctx.fill();
        });
    }

    function drawObjects(ctx, objects) {
        for (const obj of objects) {
            if (utils.isObjChildOfClass(obj, Polygon)) drawPolygon(ctx, obj);
            else if (utils.isObjChildOfClass(obj, Circle)) drawCircle(ctx, obj);
            else if (utils.isObjChildOfClass(obj, Group))
                drawObjects(ctx, obj._shapes);
        }
    }
}

function pause(args) {
    const expected = [Number];
    utils.checkArgsStrict(args, expected);
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < args[0]);
}

function rotate(args) {
    const expected = [Transformable, Point, Number];
    rotateObjects([args[0]], args[1], args[2]);

    function degToRad(degrees) {
        let pi = Math.PI;
        return degrees * (pi / 180);
    }

    function rotatePolygon(obj, p, a) {
        for (const point of obj._points) {
            let tempX = point._x - p._x;
            let tempY = point._y - p._y;
            let tempX2 =
                tempX * Math.cos(degToRad(a)) - tempY * Math.sin(degToRad(a));
            let tempY2 =
                tempY * Math.cos(degToRad(a)) + tempX * Math.sin(degToRad(a));

            point._x = tempX2 + p._x;
            point._y = tempY2 + p._y;
        }
    }

    function rotateObjects(objects, p, a) {
        for (const obj of objects) {
            if (utils.isObjChildOfClass(obj, Polygon)) rotatePolygon(obj, p, a);
            else if (utils.isObjChildOfClass(obj, Group))
                rotateObjects(obj._shapes, p, a);
        }
    }
}

function move(args) {
    utils.isObjChildOfClassStrict(args[0], Transformable);
    utils.checkArgsStrict([args[1], args[2]], [Number, Number]);
    moveObjects([args[0]], args[1], args[2]);

    function movePolygon(obj, x, y) {
        for (const point of obj._points) {
            point._x += x;
            point._y += y;
        }
    }

    function moveCircle(obj, x, y) {
        obj._point._x += x;
        obj._point._y += y;
    }

    function moveObjects(objects, x, y) {
        for (const obj of objects) {
            if (utils.isObjChildOfClass(obj, Polygon)) movePolygon(obj, x, y);
            else if (utils.isObjChildOfClass(obj, Circle))
                moveCircle(obj, x, y);
            else if (utils.isObjChildOfClass(obj, Group))
                moveObjects(obj._shapes, x, y);
        }
    }
}

function clear() {
    const canvas = document.getElementById('canvas');
    if (!canvas) utils.throwNoCanvas();
    if (canvas.getContext) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function clg(args) {
    console.log(args);
}

export const stdLib = {
    circle: (args) => new Circle(args),
    p: (args) => new Point(args),
    rgb: (args) => new Color(args),
    polygon: (args) => new Polygon(args),
    rectangle: (args) => new Rectangle(args),
    group: (args) => new Group(args),
    canvas: createCanvas,
    draw: draw,
    pause: pause,
    move: move,
    clear: clear,
    clg: clg,
    rotate: rotate,
};
