import VertexFormat from "./VertexFormat"
import * as GL from "./GL"
import Graphics3D from "./Graphics3D"
import Primitive from "./Primitive"

export enum DataType {
    Vertex = GL.ARRAY_BUFFER,
    Index = GL.ELEMENT_ARRAY_BUFFER,
}

export default abstract class DataBuffer {

    /**
     * The graphics context this is attached to.
     */
    public readonly graphics: Graphics3D
    /**
     * The mode for rendering this vertex buffer.
     */
    public readonly primitive: Primitive
    /**
     * How many elements that are currently in this buffer.
     */
    public size: number = 0
    /**
     * The intended usage for this buffer.
     * Usually STATIC_DRAW or STREAM_DRAW
     */
    public readonly usage: number
    /**
     * The underlying WebGLBuffer
     */
    protected readonly glBuffer: WebGLBuffer
    /**
     * The type of data stored, either Vertex or Index data. 
     */
    public readonly type: DataType

    constructor(graphics: Graphics3D, usage: number = GL.STREAM_DRAW, type: DataType, primitive: Primitive) {
        this.graphics = graphics
        this.usage = usage
        this.type = type
        let glBuffer = graphics.gl.createBuffer()
        if (glBuffer == null)
            throw new Error("Failed to createBuffer")
        this.glBuffer = glBuffer
        this.primitive = primitive
    }

    bind() {
        this.graphics.gl.bindBuffer(this.type, this.glBuffer)
    }

    setData(data: Float32Array | Uint16Array, size: number = data.length) {
        const offset = 0
        this.bind()
        this.graphics.gl.bufferData(this.type, data, this.usage, offset, size)
        this.size = size
    }

}