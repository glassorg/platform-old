import VirtualNode from "../../VirtualNode"
import Graphics from "../Graphics"
import Capsule from "../../math/Capsule"
import BoundingShape from "../../math/BoundingShape"
import Pickable from "./Pickable"
import PickResult from "./PickResult"

export default class Node extends VirtualNode {
    
    bounds?: BoundingShape
    pickable = Pickable.Children

    update(g: Graphics): boolean {
        let animating = false
        for (let node = this.firstChild; node != null; node = node.nextSibling) {
            if (node instanceof Node) {
                if (node.update(g)) {
                    animating = true
                }
            }
        }
        return animating
    }

    draw(g: Graphics) {
        for (let node = this.firstChild; node != null; node = node.nextSibling) {
            if (node instanceof Node) {
                node.draw(g)
            }
        }
        this.dirty = false
    }

    pick(ray: Capsule): PickResult | null {
        if (this.pickable === Pickable.None) {
            return null
        }

        if (this.pickable & Pickable.Self) {
            let result = this.pickSelf(ray)
            if (result != null) {
                return result
            }
        }

        if (this.pickable & Pickable.Children) {
            let bounds = this.bounds
            if (bounds == null || bounds.intersectsCapsule(ray)) {
                return this.pickChildren(ray)
            }    
        }

        return null
    }

    protected pickSelf(ray: Capsule): PickResult | null {
        return null
    }

    protected get pickChildrenReverse() { return false }
    protected pickChildren(ray: Capsule): PickResult | null {
        // //  check children for intersection.
        // let childRay = ray.translate(this.position.negate())
        // //  we iterate children from last to first since later children are on top.
        let reverse = this.pickChildrenReverse
        for (let child = reverse ? this.lastChild : this.firstChild;
            child != null;
            child = reverse ? child.previousSibling : child.nextSibling) {
            if (child instanceof Node) {
                let result = child.pick(ray)
                if (result != null) {
                    return result
                }
            }
        }
        return null
    }

    onpointerover?: (e: PointerEvent) => void
    onpointerout?: (e: PointerEvent) => void
    onpointermove?: (e: PointerEvent) => void
    onpointerdown?: (e: PointerEvent) => void
    onpointerup?: (e: PointerEvent) => void

}