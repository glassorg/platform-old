import Graphics from "../Graphics";
import SceneNode from "./SceneNode";
import Color from "../../math/Color";

export default class Scene extends SceneNode {

    color: Color = Color.transparent
    depth: number = 1

    draw(g: Graphics, time) {
        g.clear(this.color, this.depth)
        super.draw(g, time)
    }

}