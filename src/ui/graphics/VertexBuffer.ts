import VertexFormat from "./VertexFormat"
import * as GL from "./GL"
import Graphics3D from "./Graphics3D"
import DataBuffer, { DataType } from "./DataBuffer"
import Primitive from "./Primitive"

export default class VertexBuffer extends DataBuffer {

    /**
     * The format of the vertices stored in this buffer.
     */
    public vertexFormat: VertexFormat

    constructor(
        graphics: Graphics3D,
        vertexFormat: VertexFormat,
        usage: number = GL.STREAM_DRAW,
        primitive: number = Primitive.triangles
    )
    {
        super(graphics, usage, DataType.Vertex, primitive)
        this.vertexFormat = vertexFormat
    }

    draw() {
        if (this.size > 0) {
            this.bind()
            this.graphics.bindAttributes()
            this.graphics.bindUniforms()
            let vertexCount = this.size / this.vertexFormat!.components
            this.graphics.gl.drawArrays(this.primitive, 0, vertexCount)
        }
    }

}