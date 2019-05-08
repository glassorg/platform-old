import Graphics from "../Graphics";
import SceneNode from "./SceneNode";
import Color from "../../math/Color";
import Pickable, { isPickable } from "./Pickable";
import Capsule from "../../math/Capsule";
import Rectangle from "../../math/Rectangle";
import Vector3 from "../../math/Vector3";

export default class Control extends SceneNode implements Pickable {

    x: number = 0
    y: number = 0
    width: number = 100
    height: number = 50
    depth: number = 0
    backColor: Color = Color.white
    foreColor: Color = Color.black

    draw(g: Graphics, time) {
        if (this.backColor.isVisible) {
            g.fillRectangle(this.x, this.y, this.width, this.height, this.backColor)
        }
        super.draw(g, time)
    }

    get position() { return new Vector3(this.x, this.y, 0) }
    get bounds() { return new Rectangle(this.x, this.y, this.width, this.height) }

    pick(ray: Capsule) {
        let position = ray.line.getPosition(this.depth)
        // this assumes that the parent bounds clips any rendered children.
        if (this.bounds.contains(position)) {
            //  check children for intersection.
            let childRay = ray.translate(this.position.negate())
            //  we iterate children from last to first since later children are on top.
            for (let child = this.lastChild; child != null; child = child.previousSibling) {
                if (isPickable(child)) {
                    let picked = child.pick(childRay)
                    if (picked != null) {
                        return picked
                    }
                }
            }
            return this
        }
        return null
    }

}