import VertexFormat from "./VertexFormat"
import * as GL from "./GL"
import Graphics3D from "./Graphics3D"
import DataBuffer, { DataType } from "./DataBuffer"
import Primitive from "./Primitive"
import VertexBuffer from "./VertexBuffer"

export default class IndexBuffer extends DataBuffer {

    public readonly vertices: VertexBuffer

    constructor(
        graphics: Graphics3D,
        vertices: VertexBuffer | VertexFormat,
        usage: number = GL.STREAM_DRAW,
        primitive: number = Primitive.triangles,
    )
    {
        super(graphics, usage, DataType.Index, primitive)
        this.vertices
            = vertices instanceof VertexBuffer
            ? vertices
            : new VertexBuffer(graphics, vertices, usage, primitive)
    }

    draw() {
        if (this.size > 0) {
            this.bind()
            this.vertices.bind()
            this.graphics.bindAttributes()
            this.graphics.bindUniforms()
            this.graphics.gl.drawElements(this.primitive, this.size, GL.UNSIGNED_SHORT, 0)
        }
    }

}