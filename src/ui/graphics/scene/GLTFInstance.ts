import Node from "./Node"
import Graphics3D from "../Graphics3D"
import IndexBuffer from "../IndexBuffer"
import DataBuffer from "../DataBuffer"
import GLTFModel from "../GLTFModel"

export default class GLTFInstance extends Node {

    source!: string

    draw(g: Graphics3D) {

        let model = g.resource<GLTFModel>(GLTFModel, this.source, this)
        if (model) {
            g.program = model.program
            for (let mesh of model.meshPrimitives) {
                for (let primitive of mesh) {
                    primitive.draw()
                }
            }
        }

        super.draw(g)
    }

}
