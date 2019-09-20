import VertexFormat from "./VertexFormat"
import * as GL from "./GL"
import Graphics3D from "./Graphics3D"

export default class VertexBuffer {

    /**
     * The graphics context this is attached to.
     */
    public readonly graphics: Graphics3D
    /**
     * How many vertices are currently in this buffer.
     */
    public size: number = 0
    /**
     * The mode for rendering this vertex buffer.
     */
    public readonly mode: number = GL.TRIANGLES
    /**
     * The intended usage for this vertex buffer.
     * Usually STATIC_DRAW or STREAM_DRAW
     */
    public readonly usage: number
    /**
     * The format of the vertices stored in this buffer.
     */
    public vertexFormat: VertexFormat
    private readonly glBuffer: WebGLBuffer

    constructor(graphics: Graphics3D, vertexFormat: VertexFormat, usage: number = GL.STREAM_DRAW) {
        this.graphics = graphics
        this.usage = usage
        this.vertexFormat = vertexFormat
        let glBuffer = graphics.gl.createBuffer()
        if (glBuffer == null)
            throw new Error("Failed to createBuffer")
        this.glBuffer = glBuffer
    }

    bind() {
        this.graphics.gl.bindBuffer(GL.ARRAY_BUFFER, this.glBuffer)
    }

    setData(data: Float32Array, size: number = data.length) {
        const offset = 0
        this.bind()
        this.graphics.gl.bufferData(GL.ARRAY_BUFFER, data, this.usage, offset, size)
        this.size = size
    }

    draw() {
        if (this.size > 0) {
            this.bind()
            this.graphics.bindAttributes()
            this.graphics.bindUniforms()
            let vertexCount = this.size / this.vertexFormat!.components
            this.graphics.gl.drawArrays(this.mode, 0, vertexCount)
        }
    }

}