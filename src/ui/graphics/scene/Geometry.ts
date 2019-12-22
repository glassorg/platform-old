import Node from "./Node"
import Graphics3D from "../Graphics3D"
import IndexBuffer from "../IndexBuffer"

export default class Geometry extends Node {

    buffer!: IndexBuffer
    load?: (g: Graphics3D) => IndexBuffer
    instance?: number[]

    draw(g: Graphics3D) {
        if (this.buffer == null) {
            if (this.load == null) {
                throw new Error("You must specify either buffer or load property")
            }
            this.buffer = g.getModel(this.load) as IndexBuffer
        }

        if (this.instance) {
            g.instanceStream.writeInstance(this.buffer, this.instance)
        }
        else {
            this.buffer.draw()
        }

        super.draw(g)
    }

}
