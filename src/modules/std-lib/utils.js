function isArgInLimitsStrict(min, max, value) {
    if (value < min || value > max) throwArgBeyondLimits(min, max, value);
    return true;
}

function isIntStrict(arg) {
    if (Number.isInteger(arg)) return true;
    throwWrongArgType('Integer', `${arg}`);
}

function checkArgsStrict(args, expected) {
    if (args.length !== expected.length)
        throwWrongArgsNum(expected.length, args.length);
    for (let i = 0; i < args.length; i++)
        isObjOfClassStrict(args[i], expected[i]);
    return true;
}

function isObjOfClassStrict(obj, cls) {
    if (!isObjOfClass(obj, cls))
        throwWrongArgType(cls.name, obj.constructor.name);
    return true;
}

function isObjChildOfClassStrict(obj, cls) {
    if (!isObjChildOfClass(obj, cls))
        throwWrongArgType(cls.name, obj.constructor.name);
    return true;
}

function isObjChildOfClass(obj, cls) {
    return obj instanceof cls;
}

function isObjOfClass(obj, cls) {
    return obj.constructor === cls;
}

function throwWrongArgType(expected, got) {
    throw new Error(`Mismatching arg type!
    Expected: ${expected}
    Got: ${got}`);
}

function throwArgBeyondLimits(min, max, got) {
    throw new Error(`Arg value beyond limits!
    Min: ${min}
    Max: ${max}
    Got: ${got}`);
}

function throwWrongArgsNum(expected, got) {
    throw new Error(`Incorrect number of arguments!
    Expected: ${expected}
    Got: ${got}`);
}

function throwNoCanvas() {
    throw new Error(`No canvas!`);
}

export const utils = {
    isArgInLimitsStrict: isArgInLimitsStrict,
    isIntStrict: isIntStrict,
    checkArgsStrict: checkArgsStrict,
    isObjOfClassStrict: isObjOfClassStrict,
    isObjOfClass: isObjOfClass,
    throwWrongArgType: throwWrongArgType,
    throwArgBeyondLimits: throwArgBeyondLimits,
    throwWrongArgsNum: throwWrongArgsNum,
    isObjChildOfClassStrict: isObjChildOfClassStrict,
    throwNoCanvas: throwNoCanvas,
    isObjChildOfClass: isObjChildOfClass,
};
