import * as GL from "./GL"

export default class VertexElement {

    name: string
    size: number
    type: number
    normalize: boolean
    offset: number
    stride: number

    constructor(
        name: string,
        size: number,
        type: number = GL.FLOAT,
        normalize: boolean = type !== GL.FLOAT,
        offset: number = -1, // -1 makes VertexFormat constructor calculate
        stride: number = -1  // -1 makes VertexFormat constructor calculate
    ) {
        this.name = name
        this.size = size
        this.type = type
        this.normalize = normalize
        this.offset = offset
        this.stride = stride
    }

    toString() {
        return `${this.name},${this.size},${this.type}`
    }
}