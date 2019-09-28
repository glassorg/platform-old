import VirtualNode from "../../VirtualNode"
import Graphics from "../Graphics"
import Capsule from "../../math/Capsule"
import BoundingShape from "../../math/BoundingShape"
import Pickable from "./Pickable"
import PickResult from "./PickResult"
import Matrix4 from "../../math/Matrix4"

export default class Node extends VirtualNode {

    boundingShape?: BoundingShape
    pickable?: Pickable
    // the worldTransform, transforms from child space to world space
    //  worldTransform
    worldTransform = Matrix4.identity
    //  localTransform
    transform?: Matrix4 | null

    protected calculateWorldTransform(parentTransform, localTransform) {
        return Matrix4.multiply(parentTransform, localTransform) || Matrix4.identity
    }

    public update(g: Graphics): boolean {
        let animating = false
        if (this.updateSelf(g)) {
            animating = true
        }
        if (this.updateChildren(g)) {
            animating = true
        }
        return animating
    }

    protected updateSelf(g: Graphics) {
        let localTransform = this.transform
        let parentTransform = this.parentNode instanceof Node ? this.parentNode.worldTransform : null
        let worldTransform = this.calculateWorldTransform(parentTransform, localTransform)
        if (this.worldTransform !== worldTransform) {
            this.worldTransform = worldTransform
        }
        return false
    }

    protected updateChildren(g: Graphics) {
        let animating = false
        for (let node = this.firstChild; node != null; node = node.nextSibling!) {
            if (node instanceof Node) {
                if (node.update(g)) {
                    animating = true
                }
            }
        }
        return animating
    }

    public render(g: Graphics) {
        //  convert to uniforms
        let saveTransform = g.uniforms.modelView
        g.uniforms.modelView = this.worldTransform
        this.draw(g)
        g.uniforms.modelView = saveTransform
    }

    protected draw(g: Graphics) {
        this.drawChildren(g)
        this.dirty = false
    }

    protected drawChildren(g: Graphics) {
        for (let node = this.firstChild; node != null; node = node.nextSibling) {
            if (node instanceof Node) {
                node.render(g)
            }
        }
    }

    public pick(ray: Capsule): PickResult | null {
        let pickable = this.pickable
        if (pickable == null) {
            pickable = Pickable.children
        }
        if (pickable !== Pickable.none) {
            let { transform: localTransform } = this
            if (localTransform) {
                ray = ray.transform(localTransform.inverse())
            }
        }
        if (pickable & Pickable.children) {
            let boundingShape = this.boundingShape
            if (boundingShape == null || boundingShape.intersectsCapsule(ray)) {
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