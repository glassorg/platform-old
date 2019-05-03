import Graphics from "../Graphics";
import SceneNode from "../3d/SceneNode";
import Color from "../../math/Color";

export default class Control extends SceneNode {

    x: number = 0
    y: number = 0
    width: number = 100
    height: number = 50
    backColor: Color = Color.white
    foreColor: Color = Color.black

    draw(g: Graphics, time) {
        if (this.backColor.isVisible) {
            g.fillRectangle(this.x, this.y, this.width, this.height, this.backColor)
        }
        super.draw(g, time)
    }

}