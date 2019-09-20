import Graphics from "../Graphics"
import Node from "./Node"
import Color from "../../math/Color"
import Pickable, { isPickable } from "./Pickable"
import Capsule from "../../math/Capsule"
import Rectangle from "../../math/Rectangle"
import Vector3 from "../../math/Vector3"
import Dock, { dockLayout } from "./Dock"

type LayoutFunction = (container: Control) => void

export default class Control extends Node implements Pickable {

    x: number = 0
    y: number = 0
    width: number = 100
    height: number = 50
    backColor: Color = Color.transparent
    foreColor: Color = Color.black
    /**
     * Layout function for positioning children.
     */
    layoutChildren: LayoutFunction = dockLayout
    /**
     * Layout options for self.
     */
    layout?: any

    draw(g: Graphics) {
        this.drawBackground(g);
        this.drawChildren(g);
    }

    protected drawBackground(g: Graphics) {
        if (this.backColor.isVisible) {
            g.fillRectangle(this.x, this.y, this.width, this.height, this.backColor);
        }
    }

    protected drawChildren(g: Graphics) {
        if (this.firstChild) {
            this.layoutChildren(this);
            if (this.x !== 0 || this.y !== 0) {
                g.translate(this.x, this.y);
                super.draw(g);
                g.translate(-this.x, -this.y);
            }
            else {
                super.draw(g);
            }
        }
    }

    get position() { return new Vector3(this.x, this.y) }
    get bounds() { return new Rectangle(this.x, this.y, this.width, this.height) }

    pick(ray: Capsule) {
        let position = ray.a.center
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

    onpointerover?: (e: PointerEvent) => void
    onpointerout?: (e: PointerEvent) => void
    onpointermove?: (e: PointerEvent) => void
    onpointerdown?: (e: PointerEvent) => void
    onpointerup?: (e: PointerEvent) => void

}
