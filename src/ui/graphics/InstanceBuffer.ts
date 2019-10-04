import VertexFormat from "./VertexFormat"
import Graphics3D from "./Graphics3D"
import DataBuffer, { DataType, BufferUsage } from "./DataBuffer"
import Primitive from "./Primitive"
import VertexBuffer from "./VertexBuffer"
import DataStream from "./DataStream"
import { ModelBuildContext } from "twilio/lib/rest/autopilot/v1/assistant/modelBuild"
import IndexBuffer from "./IndexBuffer"
import * as GL from "./GL"

export default class InstanceBuffer extends VertexBuffer {

    instance: IndexBuffer

    constructor(graphics: Graphics3D, usage: BufferUsage, vertexFormat: VertexFormat, instance: IndexBuffer) {
        super(graphics, usage, vertexFormat, Primitive.models)
        this.instance = instance
    }

    /**
     * Used for instanced rendering.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/vertexAttribDivisor
     */
    get vertexDivisor() {
        return 1
    }

    draw() {
        if (this.size > 0) {
            let vertices = this.instance.vertices
            this.graphics.bindAttributes([vertices, this])
            this.graphics.bindUniforms()
            let vertexCount = vertices.size / vertices.vertexFormat.components
            let instanceCount = this.size / this.vertexFormat.components
            this.instance.bind()
            this.graphics.gl.drawElementsInstanced(vertices.primitive, vertexCount, GL.UNSIGNED_SHORT, 0, instanceCount)
        }
    }

}