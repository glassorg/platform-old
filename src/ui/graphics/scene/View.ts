import Graphics from "../Graphics"
import Control from "./Control"
import Matrix4 from "../../math/Matrix4"
import Dock from "./Dock"
import Graphics3D from "../Graphics3D"

export default class View extends Control {

    projection: Matrix4 = Matrix4.identity
    layout = Dock.fill

    drawChildren(g: Graphics) {
        let saveProjection = g.uniforms.projection
        g.uniforms.projection = this.projection
        if (g instanceof Graphics3D) {
            // really we need the absolute x, y position taking ancestors into account
            g.gl.viewport(g.width - this.width + this.x, g.height - this.height - this.y, this.width, this.height)
        }
        super.drawChildren(g)
        if (g instanceof Graphics3D) {
            // restore viewport
            g.gl.viewport(0, 0, g.width, g.height)
        }

        g.uniforms.projection = saveProjection
    }

}
