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

    writeInstance(instance: IndexBuffer, components: number[]) {
        if (this.buffer.instance !== instance) {
            this.flush()
            this.buffer.instance = instance
        }
        this.write(components)
    }

}