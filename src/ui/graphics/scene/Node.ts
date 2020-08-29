import VirtualNode from "../../VirtualNode"
import Graphics from "../Graphics"
import Capsule from "../../math/Capsule"
import BoundingShape from "../../math/BoundingShape"
import Pickable from "./Pickable"
import PickResult from "./PickResult"
import Matrix4 from "../../math/Matrix4"
import Effect from "../effects/Effect"
import Program from "../Program"

export default class Node extends VirtualNode {

    _boundingShape?: BoundingShape
    _pickable?: Pickable
    //  the worldTransform, transforms from child space to world space
    //  worldTransform
    worldTransform = Matrix4.identity
    //  localTransform
    _transform?: Matrix4 | null
    //  effect to use when rendering this node
    _effect?: Effect | null

    public get effect() {
        return this._effect || null
    }
    public set effect(value) {
        this._effect = value
    }

    get transform() {
        return this._transform
    }
    set transform(value) {
        this._transform = value
    }

    get boundingShape() {
        return this._boundingShape
    }
    set boundingShape(value) {
        this._boundingShape = value
    }

    get pickable() {
        return this._pickable
    }
    set pickable(value) {
        this._pickable = value
    }

    protected calculateWorldTransform(parentTransform, localTransform) {
        return Matrix4.multiply(parentTransform, localTransform) || Matrix4.identity
    }

    public update(g: Graphics): boolean {
        let animating = false
        let localTransform = this.transform
        let parentTransform = this.parentNode instanceof Node ? this.parentNode.worldTransform : null
        let worldTransform = this.calculateWorldTransform(parentTransform, localTransform)
        if (this.worldTransform !== worldTransform) {
            this.worldTransform = worldTransform
        }
        if (this.updateSelf(g)) {
            animating = true
        }
        if (this.updateChildren(g)) {
            animating = true
        }
        return animating
    }

    public updateSelf(g: Graphics) {
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
        if (this._effect == null) {
            this.draw(g)
        }
        else {
            this._effect.render(g as any, this.draw.bind(this))
        }
        this.dirty = false
        g.uniforms.modelView = saveTransform
    }

    public draw(g: Graphics) {
        this.drawSelf(g)
        this.drawChildren(g)
    }

    public drawSelf(g: Graphics) {
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