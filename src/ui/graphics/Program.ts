import VertexFormat from "./VertexFormat"
import VertexShader from "./VertexShader"
import FragmentShader from "./FragmentShader"
import PositionColor3D_VertexShader from "./effects/PositionColor3D.vs"
import Color_FragmentShader from "./effects/Color.fs"
import PositionColor2D_VertexShader from "./effects/PositionColor2D.vs"
import PositionTexture3D_VertexShader from "./effects/PositionTexture3D.vs"
import Texture_FragmentShader from "./effects/Texture.fs"
import PositionColorTexture3D_VertexShader from "./effects/PositionColorTexture3D.vs"
import PositionColorTexture2D_VertexShader from "./effects/PositionColorTexture2D.vs"
import ColorTexture_FragmentShader from "./effects/ColorTexture.fs"
import Effect from "./effects/Effect"
import Graphics3D from "./Graphics3D"

/**
 * Shader program declaration.
 * Specifies the shader sources and the vertex format.
 */
export default class Program implements Effect {

    public readonly id: string
    public readonly vertexShader: VertexShader
    public readonly fragmentShader: FragmentShader

    constructor(vertexShader: VertexShader, fragmentShader: FragmentShader) {
        this.id = `${vertexShader}:${fragmentShader}`
        this.vertexShader = vertexShader
        this.fragmentShader = fragmentShader
    }

    // a Program implements the most basic Effect interface
    render(g: Graphics3D, callback: (g: Graphics3D) => void) {
        let saveProgram = g.program
        g.program = this
        callback(g)
        g.program = saveProgram
    }

    toString() {
        return this.id
    }

    public static readonly default3D: Program = new Program(
        new VertexShader(VertexFormat.positionColorTexture, PositionColorTexture3D_VertexShader),
        new FragmentShader(ColorTexture_FragmentShader)
    )

    // public static readonly default3D: Program = new Program(
    //     new VertexShader(VertexFormat.positionColor, PositionColor3D_VertexShader),
    //     new FragmentShader(Color_FragmentShader)
    // )

    public static readonly default2D: Program = new Program(
        new VertexShader(VertexFormat.positionColorTexture, PositionColorTexture2D_VertexShader),
        Program.default3D.fragmentShader
    )

    public static readonly texture3D: Program = new Program(
        new VertexShader(VertexFormat.positionTexture, PositionTexture3D_VertexShader),
        new FragmentShader(Texture_FragmentShader)
    )
}