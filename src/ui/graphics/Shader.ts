

export default abstract class Shader {

    public readonly source: string
    public readonly version: 1 | 2 | 3

    constructor(source: string, version: 1 | 2 | 3 = 3) {
        if (version === 3) {
            source =  "#version 300 es\n" + source
        }
        this.source = source
        this.version = version
    }

    toString() {
        return this.source
    }

}