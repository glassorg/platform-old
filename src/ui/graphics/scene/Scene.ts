import Graphics from "../Graphics";
import Color from "../../math/Color";
import Control from "./Control";

export default class Scene extends Control {

    width = window.outerWidth
    height = window.outerHeight
    backColor = Color.transparent
    depth = 1

    draw(g: Graphics, time) {
        g.clear(this.backColor, this.depth)

        // (position.x * 2.0) / screen.x - 1.0,
        // 1.0 - (position.y * 2.0) / screen.y,
        // position.z * 2.0 * -1.0,
        // position.w

        super.draw(g, time)
    }

}