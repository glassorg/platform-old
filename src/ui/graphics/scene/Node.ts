import VirtualNode from "../../VirtualNode"
import Graphics from "../Graphics"
import Capsule from "../../math/Capsule"

export default class Node extends VirtualNode {

    draw(g: Graphics) {
        for (let node = this.firstChild; node != null; node = node.nextSibling) {
            if (node instanceof Node) {
                node.draw(g)
            }
        }
        this.dirty = false
    }

    pick(ray: Capsule) {
        let position = ray.a.center
        // this assumes that the parent bounds clips any rendered children.
        // if (this.bounds.contains(position)) {
        //     //  check children for intersection.
        //     let childRay = ray.translate(this.position.negate())
        //     //  we iterate children from last to first since later children are on top.
        //     for (let child = this.lastChild; child != null; child = child.previousSibling) {
        //         // if (isPickable(child)) {
        //         //     let picked = child.pick(childRay)
        //         //     if (picked != null) {
        //         //         return picked
        //         //     }
        //         // }
        //     }
        //     return this
        // }
        return null
    }

}