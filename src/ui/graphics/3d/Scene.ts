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
        super.draw(g, time)
    }

}