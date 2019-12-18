import VertexBuffer from "./VertexBuffer"
import * as GL from "./GL"
import VertexFormat from "./VertexFormat"
import DataStream from "./DataStream"
import { BufferUsage } from "./DataBuffer"
import VertexStream from "./VertexStream"
import InstanceBuffer from "./InstanceBuffer"
import IndexBuffer from "./IndexBuffer"

const sizeOfFloat = 4

export default class InstanceStream extends VertexStream {

    public readonly buffer!: InstanceBuffer

    constructor(buffer: InstanceBuffer, count = 64 * 1024) {
        super(buffer, count)
    }

    writeInstance(instance: IndexBuffer, components: number[])
    writeInstance(instance: IndexBuffer, ...components: number[])
    writeInstance(instance: IndexBuffer) {
        if (this.buffer.instance !== instance) {
            this.flush()
            this.buffer.instance = instance
        }
        const components = typeof arguments[1] === "number" ? Array.prototype.slice.call(arguments, 1) : arguments[1]
        this.write(components)
    }

}