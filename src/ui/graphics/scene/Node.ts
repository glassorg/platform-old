import VirtualNode from "../../VirtualNode"
import Graphics from "../Graphics"
import Capsule from "../../math/Capsule"
import BoundingShape from "../../math/BoundingShape"
import Pickable from "./Pickable"
import PickResult from "./PickResult"
import Matrix4 from "../../math/Matrix4"

export default class Node extends VirtualNode {

    bounds?: BoundingShape
    pickable?: Pickable
    // the worldTransform, transforms from child space to world space
    //  worldTransform
    worldTransform = Matrix4.identity
    //  localTransform
    localTransform?: Matrix4 | null

    protected calculateWorldTransform(parentTransform, localTransform) {
        return Matrix4.multiply(parentTransform, localTransform) || Matrix4.identity
    }

    update(g: Graphics): boolean {
        let animating = false
        if (this.firstChild != null) {
            // update worldTransform
            let localTransform = this.localTransform
            let parentTransform = this.parentNode instanceof Node ? this.parentNode.worldTransform : null
            let worldTransform = this.calculateWorldTransform(localTransform, parentTransform)
            if (this.worldTransform !== worldTransform) {
                this.worldTransform = worldTransform
            }
    
            // update children
            for (let node = this.firstChild; node != null; node = node.nextSibling!) {
                if (node instanceof Node) {
                    if (node.update(g)) {
                        animating = true
                    }
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
        let pickable = this.pickable || 0
        if (pickable & Pickable.children) {
            let bounds = this.bounds
            if (bounds == null || bounds.intersectsCapsule(ray)) {
                let result = this.pickChildren(ray)
                if (result != null) {
                    return result
                }
            }
        }

        if (pickable & Pickable.self) {
            let result = this.pickSelf(ray)
            if (result != null) {
                return result
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
        let { localTransform } = this
        if (localTransform) {
            ray = ray.transform(localTransform.inverse())
        }
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