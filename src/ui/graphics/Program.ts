import VertexFormat from "./VertexFormat";
import VertexShader from "./VertexShader";
import FragmentShader from "./FragmentShader";

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
        new VertexShader(
            VertexFormat.positionColor,
            `
            uniform mat4 modelViewProjection;

            in vec3 position;
            in vec4 color;

            out vec4 vs_color;
            void main() {
                gl_Position = vec4(position, 1) * modelViewProjection;
                vs_color = color;
            }
            `,
            true
        ),
        new FragmentShader(
            `
            precision mediump float;
            in vec4 vs_color;
            out vec4 outColor;
            void main() {
                outColor = vs_color;
            }
            `
        )
    )

    public static readonly default2D: Program = new Program(
        new VertexShader(
            VertexFormat.positionColor,
            `
            in vec4 position;
            in vec4 color;
            uniform vec2 screen;
            //  we pretransform our vectors
            //  so we just need the final projection
            uniform mat4 projection;

            out vec4 vs_color;
            void main() {
                gl_Position = position * projection;
                vs_color = color;
            }
            `
        ),
        Program.default3D.fragmentShader
    )

    public static readonly texture3D: Program = new Program(
        new VertexShader(
            VertexFormat.positionTexture2D,
            `
            uniform mat4 modelViewProjection;

            in vec3 position;
            in vec2 textureCoordinates;

            out vec2 vs_textureCoordinates;
            void main() {
                gl_Position = vec4(position, 1) * modelViewProjection;
                vs_textureCoordinates = textureCoordinates;
            }
            `
        ),
        new FragmentShader(
            `
            precision mediump float;
            uniform sampler2D colorTexture;
            in vec2 vs_textureCoordinates;
            out vec4 outColor;
            void main() {
                outColor = texture(colorTexture, vs_textureCoordinates);
            }
            `
        )
    )
}