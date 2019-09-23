import Color from "../math/Color"
import Graphics from "./Graphics"
import * as GL from "./GL"
import { createShader, createProgram, createTexture } from "./functions"
import Program from "./Program"
import VertexShader from "./VertexShader"
import FragmentShader from "./FragmentShader"
import { memoize } from "../../utility/common"
import { Uniforms, createUniforms, setUniform } from "./Uniforms"
import VertexBuffer from "./VertexBuffer"
import VertexStream from "./VertexStream"
import Vector2 from "../math/Vector2"
import Matrix4 from "../math/Matrix4"
import Vector3 from "../math/Vector3"

export default class Graphics3D extends Graphics {

    public readonly gl: WebGL2RenderingContext
    public readonly uniforms: Uniforms

    private getWebGLVertexShader: (shader: VertexShader) => WebGLShader
    private getWebGLFragmentShader: (shader: FragmentShader) => WebGLShader
    private getWebGLProgram: (program: Program) => WebGLProgram
    public getWebGLTexture: (name: string) => WebGLTexture

    private vertexStream: VertexStream
    private boundTextureUnits: WebGLTexture[] = []

    constructor(gl: WebGL2RenderingContext) {
        super()
        this.gl = gl
        this.uniforms = createUniforms(gl, this.flush.bind(this))
        this.getWebGLVertexShader = memoize((shader: VertexShader) => {
            return createShader(this.gl, GL.VERTEX_SHADER, shader.source)
        })
        this.getWebGLFragmentShader = memoize((shader: FragmentShader) => {
            return createShader(this.gl, GL.FRAGMENT_SHADER, shader.source)
        })
        this.getWebGLProgram = memoize((program: Program) => {
            let vs = this.getWebGLVertexShader(program.vertexShader)
            let fs = this.getWebGLFragmentShader(program.fragmentShader)
            return createProgram(this.gl, vs, fs)
        })
        this.getWebGLTexture = memoize((name: string) => createTexture(this.gl, name, () => (gl.canvas as any).dirty = true))

        //  set the default program for now
        this.program = Program.default2D

        //  we need to flush and change the vertex format for stream buffers
        //  when changing program
        this.vertexStream = new VertexStream(
            new VertexBuffer(this, this.program.vertexShader.vertexFormat)
        )

        gl.enable(GL.BLEND)
        gl.enable(GL.DEPTH_TEST)
        gl.depthFunc(GL.LEQUAL)
        gl.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA)

        this.updateScreenSize()
    }

    public bindTexture(texture: WebGLTexture): number {
        for (let i = 0; i < this.boundTextureUnits.length; i++) {
            if (this.boundTextureUnits[i] === texture) {
                return i
            }
        }
        let i = this.boundTextureUnits.length
        this.boundTextureUnits[i] = texture
        this.gl.activeTexture(GL.TEXTURE0 + i)
        this.gl.bindTexture(GL.TEXTURE_2D, texture)
        return i
    }

    private updateScreenSize() {
        let { width, height } = this.gl.canvas
        this.uniforms.screen = new Vector2(width, height)
    }

    get width() {
        return this.gl.canvas.width
    }

    get height() {
        return this.gl.canvas.height
    }

    translate(dx: number, dy: number, dz: number) {
        this.uniforms.translate(dx, dy, dz)
    }

    rotate(angle: number) {
        this.uniforms.rotate(angle)
    }

    scale(sx: number, sy: number, sz: number) {
        this.uniforms.scale(sx, sy, sz)
    }

    transform(m: Matrix4) {
        this.uniforms.transform(m)
    }

    clear(color: Color = Color.transparent, depth: number = 1) {
        let { gl } = this
        gl.clearColor(color.red, color.green, color.blue, color.alpha)
        gl.clearDepth(depth)
        gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT)
    }

    begin() {
        this.uniforms.model = Matrix4.identity
        this.uniforms.view = Matrix4.identity
        this.uniforms.projection = Matrix4.identity
    }

    end() {
        this.flush()
    }

    bindAttributes() {
        const vertexFormat = this.program.vertexShader.vertexFormat
        const gl = this.gl
        const program = this.getWebGLProgram(this.program)
        //  automatically set vertex attribute pointers
        //  this will only work if the name of the attributes
        //  within the vertex shader is the same as the name of elements in the vertex format
        const count = this.gl.getProgramParameter(program, GL.ACTIVE_ATTRIBUTES)
        for (let i = 0; i < count; ++i) {
            const attribute = gl.getActiveAttrib(program, i)!
            const location = gl.getAttribLocation(program, attribute.name)
            const element = vertexFormat.elements[attribute.name]
            if (element == null)
                throw new Error(`VertexElement not found: ${attribute.name}`)
            gl.vertexAttribPointer(location, element.size, element.type, element.normalize, element.stride, element.offset)
            gl.enableVertexAttribArray(location)
        }
    }

    bindUniforms() {
        const gl = this.gl
        const program = this.getWebGLProgram(this.program)
        //  automatically set vertex attribute pointers
        //  this will only work if the name of the attributes
        //  within the vertex shader is the same as the name of elements in the vertex format
        const count = this.gl.getProgramParameter(program, GL.ACTIVE_UNIFORMS)
        for (let i = 0; i < count; ++i) {
            const attribute = gl.getActiveUniform(program, i)!
            const location = gl.getUniformLocation(program, attribute.name)!
            let value = this.uniforms[attribute.name]
            if (value.toArray)
                value = value.toArray()
            // set uniform value, need abstraction for writing uniforms
            setUniform(this, attribute, location, value)
        }
    }

    fillRectangle(x: number, y: number, width: number, height: number, color: Color, depth: number = 0) {
        let a = new Vector3(x, y, depth).transform(this.uniforms.model)
        let b = new Vector3(x + width, y, depth).transform(this.uniforms.model)
        let c = new Vector3(x, y + height, depth).transform(this.uniforms.model)
        let d = new Vector3(x + width, y + height, depth).transform(this.uniforms.model)
        this.vertexStream.write(
            ...a, ...color,
            ...b, ...color,
            ...c, ...color,
            ...c, ...color,
            ...b, ...color,
            ...d, ...color,
        )
    }

    private _program!: Program
    get program(): Program {
        return this._program
    }
    set program(value: Program) {
        if (this._program !== value) {
            this.flush()
            this._program = value
            this.gl.useProgram(this.getWebGLProgram(value))
            if (this.vertexStream) {
                this.vertexStream.buffer.vertexFormat = value.vertexShader.vertexFormat
            }
        }
    }

    flush(property?: string) {
        if (this.vertexStream && (property !== "model" || !this.program.vertexShader.pretransformed)) {
            this.vertexStream.flush()
        }
    }

    write(...components: number[]) {
        this.vertexStream.write(...components)
    }

}

//      Graphics3D
//          .uniforms: { [name: string]: number[] }
//          .program: Program
//              .vertexShader: VertexShader
//              .fragmentShader: FragmentShader
//          .stream(...components: number[])

//  uniforms
//      ModelView
//      Projection
//      Screen
//      project * view * model <- applied reverse order
