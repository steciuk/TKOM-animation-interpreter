export class Program {
    constructor(instructions, funMap) {
        this.instructions = instructions
        this.funMap = funMap
        this.libFunMap = null
    }

    setLibFunMap(map) {
        this.libFunMap = map
    }
}