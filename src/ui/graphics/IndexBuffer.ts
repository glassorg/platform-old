import VertexFormat from "./VertexFormat"
import * as GL from "./GL"
import Graphics3D from "./Graphics3D"
import DataBuffer, { DataType, BufferUsage } from "./DataBuffer"
import Primitive from "./Primitive"
import VertexBuffer from "./VertexBuffer"

export enum ElementType {
    UnsignedShort = GL.UNSIGNED_SHORT,
    UnsignedInt = GL.UNSIGNED_INT
}

export default class IndexBuffer extends DataBuffer {

    public readonly vertices: VertexBuffer[]
    public readonly elementType: ElementType

    constructor(
        graphics: Graphics3D,
        usage: BufferUsage,
        vertices: VertexBuffer | VertexFormat | VertexBuffer[],
        primitive = Primitive.triangles,
        glBuffer?: WebGLBuffer,
        elementType = ElementType.UnsignedShort,
        offset?: number,
        size = 0,
    )
    {
        super(graphics, usage, DataType.Index, primitive, glBuffer, offset)
        this.size = size
        this.elementType = elementType
        this.vertices = Array.isArray(vertices) ? vertices
            : [
                vertices instanceof VertexBuffer ? vertices
                : new VertexBuffer(graphics, usage, vertices, primitive)
            ]
    }

    draw() {
        if (this.size > 0) {
            this.graphics.bindAttributes(this.vertices)
            this.graphics.bindUniforms()
            this.bind()
            this.graphics.gl.drawElements(this.primitive, this.size, this.elementType, this.offset)
        }
    }

}