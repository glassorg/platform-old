import * as GL from "./GL"
import IndexBuffer from "./IndexBuffer"
import VertexStream from "./VertexStream"
import Primitive from "./Primitive"
import DataStream from "./DataStream"
import { BufferUsage } from "./DataBuffer"

const sizeOfUint16 = 2

const pointOffsets = [0]
const lineOffsets = [0, 1]
const triangleOffsets = [0, 1, 2]
const quadOffsets = [0, 1, 2, 2, 1, 3]

export default class IndexStream extends DataStream {

    private data: Uint16Array
    vertices: VertexStream
    buffer: IndexBuffer
    size: number = 0

    constructor(buffer: IndexBuffer, count = 64 * 1024) {
        super()
        this.buffer = buffer
        this.vertices = new VertexStream(buffer.vertices, count)
        let data = new ArrayBuffer(count * sizeOfUint16)
        this.data = new Uint16Array(data)
    }

    get vertexFormat() {
        return this.vertices.vertexFormat
    }
    set vertexFormat(value) {
        this.buffer.vertices.vertexFormat = value
    }

    /**
     * Fills the underlying buffer with the streaming data
     * then optionally draws it.
     */
    flush(draw = true) {
        if (this.size > 0) {
            this.vertices.flush(false)
            this.buffer.setData(this.data, this.size)
            if (draw && this.buffer.usage === BufferUsage.streamDraw) {
                this.buffer.draw()
            }
            this.size = 0
        }
    }

    private willFlush(indexCount: number) {
        return this.size + indexCount > this.data.length
    }

    private countVerticesAndFlushIfNeeded(componentCount: number, indicesPerVertex = 1){
        let vertexCount = componentCount / this.vertices.buffer.vertexFormat.components
        let indexCount = vertexCount * indicesPerVertex
        if (this.willFlush(indexCount) || this.vertices.willFlush(componentCount)) {
            this.flush()
        }
        return vertexCount
    }

    private writeInternal(components: number[], offsets: number[], primitive: Primitive, expectedVertexFactor = offsets.length) {
        if (this.buffer.primitive !== primitive) {
            throw new Error(`Wrong primitive type: ${primitive}`)
        }
        let vertexCount = this.countVerticesAndFlushIfNeeded(components.length)
        if (vertexCount % expectedVertexFactor !== 0) {
            throw new Error(`Invalid number of vertices: ${vertexCount}`)
        }
        let index = this.vertices.vertexCount
        this.vertices.write(components)
        // we manually write the indices to avoid allocating an intermediate array
        let indexCount = vertexCount / expectedVertexFactor * offsets.length
        for (let i = 0; i < indexCount; i++) {
            let primitiveIndex = Math.floor(i / offsets.length)
            let offset = offsets[i % offsets.length]
            this.data[this.size++] = index + primitiveIndex * offsets.length + offset
        }
    }

    write(components: number[]) {
        // when someone uses this write, we don't really want to error check them
        this.writeInternal(components, pointOffsets, this.buffer.primitive, 1)
    }

    writePoints(components: number[]) {
        this.writeInternal(components, pointOffsets, Primitive.points)
    }

    writeLines(components: number[]) {
        this.writeInternal(components, lineOffsets, Primitive.lines)
    }

    writeTriangles(components: number[]) {
        this.writeInternal(components, triangleOffsets, Primitive.triangles)
    }

    writeQuads(components: number[]) {
        this.writeInternal(components, quadOffsets, Primitive.triangles, 4)
    }

}