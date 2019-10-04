import Shader from "./Shader"
import VertexFormat from "./VertexFormat"
import Primitive from "./Primitive"

export default class VertexShader extends Shader {

    public readonly vertexFormats: VertexFormat[]
    public readonly primitive: Primitive

    constructor(
        vertexFormat: VertexFormat | VertexFormat[],
        source: string,
        primitive: Primitive = Array.isArray(vertexFormat) ? Primitive.models : Primitive.triangles
    ) {
        super(source)
        this.vertexFormats = Array.isArray(vertexFormat) ? vertexFormat : [vertexFormat]
        this.primitive = primitive
    }

    get vertexFormat(): VertexFormat {
        return this.vertexFormats[this.vertexFormats.length - 1]
    }

}