import Node from "./Node"
import Graphics3D from "../Graphics3D"
import IndexBuffer from "../IndexBuffer"
import DataBuffer from "../DataBuffer"

export default class Geometry extends Node {

    buffer!: DataBuffer
    load?: (g: Graphics3D) => DataBuffer
    instance?: number[]

    draw(g: Graphics3D) {
        if (this.buffer == null) {
            if (this.load == null) {
                throw new Error("You must specify either buffer or load property")
            }
            this.buffer = g.getMesh(this.load)
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
