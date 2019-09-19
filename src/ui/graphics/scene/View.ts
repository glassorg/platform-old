import Graphics from "../Graphics";
import Color from "../../math/Color";
import { ControlNode } from "./Control";
import Graphics3D from "../Graphics3D";
import Matrix4 from "../../math/Matrix4";
import Dock from "./Dock";

export class ViewNode extends ControlNode {

    projection: Matrix4 = Matrix4.identity
    layout = Dock.fill

    draw(g: Graphics) {
        this.drawBackground(g)
        if (g instanceof Graphics3D){
            g.uniforms.projection = this.projection
        }
        this.drawChildren(g)
    }

}

const View = ViewNode.getFactory<ViewNode>()
export default View