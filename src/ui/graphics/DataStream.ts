import * as GL from "./GL"
import IndexBuffer from "./IndexBuffer"
import VertexStream from "./VertexStream"
import VertexFormat from "./VertexFormat"

const sizeOfUint16 = 2

const pointOffsets = [0]
const lineOffsets = [0, 1]
const triangleOffsets = [0, 1, 2]
const quadOffsets = [0, 1, 2, 2, 1, 3]

export default abstract class DataStream {

    abstract flush(draw?: boolean)
    abstract vertexFormat: VertexFormat

    abstract write(components: number[])
    abstract writePoints(components: number[])
    abstract writeLines(components: number[])
    abstract writeTriangles(components: number[])
    abstract writeQuads(components: number[])

}