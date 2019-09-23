import VertexFormat from "./VertexFormat"
import VertexShader from "./VertexShader"
import FragmentShader from "./FragmentShader"
import PositionColor3D_VertexShader from "./shaders/PositionColor3D.vs"
import Color_FragmentShader from "./shaders/Color.fs"
import PositionColor2D_VertexShader from "./shaders/PositionColor2D.vs"
import PositionTexture3D_VertexShader from "./shaders/PositionTexture3D.vs"
import Texture_FragmentShader from "./shaders/Texture.fs"

/**
 * Shader program declaration.
 * Specifies the shader sources and the vertex format.
 */
export default class Program {

    public readonly id: string
    public readonly vertexShader: VertexShader
    public readonly fragmentShader: FragmentShader

    constructor(vertexShader: VertexShader, fragmentShader: FragmentShader) {
        this.id = `${vertexShader}:${fragmentShader}`
        this.vertexShader = vertexShader
        this.fragmentShader = fragmentShader
    }

    toString() {
        return this.id
    }

    public static readonly default3D: Program = new Program(
        new VertexShader(VertexFormat.positionColor, PositionColor3D_VertexShader, true),
        new FragmentShader(Color_FragmentShader)
    )

    public static readonly default2D: Program = new Program(
        new VertexShader(VertexFormat.positionColor, PositionColor2D_VertexShader),
        Program.default3D.fragmentShader
    )

    public static readonly texture3D: Program = new Program(
        new VertexShader(VertexFormat.positionTexture, PositionTexture3D_VertexShader),
        new FragmentShader(Texture_FragmentShader)
    )
}