import Shader from "./Shader";
import VertexFormat from "./VertexFormat";

export default class VertexShader extends Shader {

    public readonly vertexFormat: VertexFormat

    constructor(vertexFormat: VertexFormat, source: string) {
        super(source)
        this.vertexFormat = vertexFormat
    }

}