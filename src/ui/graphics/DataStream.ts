import VertexFormat from "./VertexFormat"

export default abstract class DataStream {

    abstract flush(draw?: boolean)
    abstract vertexFormat: VertexFormat

    abstract write(components: number[])
    abstract writePoints(components: number[])
    abstract writeLines(components: number[])
    abstract writeTriangles(components: number[])
    abstract writeQuads(components: number[])

}