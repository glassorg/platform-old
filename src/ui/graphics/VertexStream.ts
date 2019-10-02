import VertexBuffer from "./VertexBuffer"
import * as GL from "./GL"
import VertexFormat from "./VertexFormat"
import DataStream from "./DataStream"
import { BufferUsage } from "./DataBuffer"

const sizeOfFloat = 4

export default class VertexStream extends DataStream {

    public readonly buffer: VertexBuffer
    private floatData: Float32Array
    private uintData: Uint32Array
    private size: number = 0

    constructor(buffer: VertexBuffer, count = 64 * 1024) {
        super()
        this.buffer = buffer
        let data = new ArrayBuffer(count * sizeOfFloat)
        this.floatData = new Float32Array(data)
        this.uintData = new Uint32Array(data)
    }

    get vertexFormat() {
        return this.buffer.vertexFormat
    }
    set vertexFormat(value) {
        this.buffer.vertexFormat = value
    }

    /**
     * Fills the underlying buffer with the streaming data
     * then optionally draws it.
     */
    flush(draw = true) {
        if (this.size > 0) {
            this.buffer.setData(this.floatData, this.size)
            if (draw && this.buffer.usage === BufferUsage.streamDraw) {
                this.buffer.draw()
            }
            this.size = 0
        }
    }

    get vertexCount() {
        return this.size / this.buffer.vertexFormat.components
    }

    willFlush(componentCount: number) {
        return this.size + componentCount > this.floatData.length
    }
    
    write(components: number[]) {
        if (this.willFlush(components.length)) {
            this.flush()
        }
        let floatElements = this.buffer.vertexFormat.floatElements
        for (let i = 0; i < components.length; i++) {
            if (floatElements[i % floatElements.length]) {
                this.floatData[this.size++] = components[i]
            } else {
                this.uintData[this.size++] = components[i]
            }
        }
    }

    writePoints(components: number[]) {
        this.write(components)
    }
    writeLines(components: number[]) {
        this.write(components)
    }
    writeTriangles(components: number[]) {
        this.write(components)
    }
    writeQuads(components: number[]) {
        throw new Error("not implemented yet, we have to copy a bunch of components")
    }

}