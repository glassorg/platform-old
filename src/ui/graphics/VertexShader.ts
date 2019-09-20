import Shader from "./Shader"
import VertexFormat from "./VertexFormat"

export default class VertexShader extends Shader {

    public readonly vertexFormat: VertexFormat
    public readonly pretransformed: boolean

    constructor(vertexFormat: VertexFormat, source: string, pretransformed: boolean = false) {
        super(source)
        this.vertexFormat = vertexFormat
        this.pretransformed = pretransformed
    }

}