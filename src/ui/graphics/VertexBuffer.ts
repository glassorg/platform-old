import VertexFormat from "./VertexFormat"
import Graphics3D from "./Graphics3D"
import DataBuffer, { DataType, BufferUsage } from "./DataBuffer"
import Primitive from "./Primitive"

export default class VertexBuffer extends DataBuffer {

    /**
     * The format of the vertices stored in this buffer.
     */
    public vertexFormat: VertexFormat

    constructor(
        graphics: Graphics3D,
        usage: BufferUsage,
        vertexFormat: VertexFormat,
        primitive: number = Primitive.triangles,
        glBuffer?: WebGLBuffer,
        offset?: number
    ) {
        super(graphics, usage, DataType.Vertex, primitive, glBuffer, offset)
        this.vertexFormat = vertexFormat
    }

    /**
     * Used for instanced rendering.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/vertexAttribDivisor
     */
    get vertexDivisor() {
        //  0 means this contains normal non instanced vertex attributes
        return 0
    }

    draw() {
        if (this.size > 0) {
            this.graphics.bindAttributes([this])
            this.graphics.bindUniforms()
            let vertexCount = this.size / this.vertexFormat!.components
            this.graphics.gl.drawArrays(this.primitive, 0, vertexCount)
        }
    }

}