import Node from "./Node"
import DataBuffer from "../DataBuffer"
import Graphics3D from "../Graphics3D"

export default class Geometry extends Node {

    buffer!: DataBuffer
    load?: (g: Graphics3D) => DataBuffer

    draw(g: Graphics3D) {
        if (this.buffer == null) {
            // TODO: also dispose of this dynamically loaded buffer.
            if (this.load == null) {
                throw new Error("You must specify either buffer or load property")
            }
            this.buffer = this.load(g)
        }
        this.buffer.draw()
        super.draw(g)
    }

}
