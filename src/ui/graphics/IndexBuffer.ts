import VertexFormat from "./VertexFormat"
import * as GL from "./GL"
import Graphics3D from "./Graphics3D"
import DataBuffer, { DataType, BufferUsage } from "./DataBuffer"
import Primitive from "./Primitive"
import VertexBuffer from "./VertexBuffer"

export default class IndexBuffer extends DataBuffer {

    public readonly vertices: VertexBuffer

    constructor(
        graphics: Graphics3D,
        usage: BufferUsage,
        vertices: VertexBuffer | VertexFormat,
        primitive = Primitive.triangles,
    )
    {
        super(graphics, usage, DataType.Index, primitive)
        this.vertices
            = vertices instanceof VertexBuffer
            ? vertices
            : new VertexBuffer(graphics, usage, vertices, primitive)
    }

    draw() {
        if (this.size > 0) {
            this.graphics.bindAttributes([this.vertices])
            this.graphics.bindUniforms()
            this.bind()
            this.graphics.gl.drawElements(this.primitive, this.size, GL.UNSIGNED_SHORT, 0)
        }
    }

}