import Graphics from "../Graphics"
import Node from "./Node"
import Color from "../../math/Color"
// import Pickable, { isPickable } from "./Pickable"
import Capsule from "../../math/Capsule"
import Rectangle from "../../math/Rectangle"
import Vector3 from "../../math/Vector3"
import Dock, { layout } from "./Dock"
import Spacing from "../../math/Spacing"
import Size from "../../math/Size"
import BoundingShape from "../../math/BoundingShape"
import Line from "../../math/Line"
import Pickable from "./Pickable"
import PickResult from "./PickResult"
import Matrix4 from "../../math/Matrix4"
import { equals } from "../functions"

type LayoutFunction = (container: Control) => void

export default class Control extends Node {

    private _x = 0
    private _y = 0
    width = 100
    height = 50
    backColor = Color.transparent
    foreColor = Color.black
    margin = Spacing.zero
    padding = Spacing.zero
    pickRadius?: number
    minimumSize?: Size
    maximumSize?: Size
    optimumSize?: Size
    localTransformValid?: boolean

    /**
     * Layout function for positioning children.
     */
    layoutChildren: LayoutFunction = layout
    /**
     * Layout options for self.
     */
    layout?: any

    set x(value) {
        if (this._x !== value) {
            this.localTransformValid = false
            this._x = value
        }
    }
    get x() {
        return this._x
    }
    set y(value) {
        if (this._y !== value) {
            this.localTransformValid = false
            this._y = value
        }
    }
    get y() {
        return this._y
    }

    draw(g: Graphics) {
        this.drawBackground(g)
        this.drawChildren(g)
    }

    protected drawBackground(g: Graphics) {
        if (this.backColor.isVisible) {
            g.fillRectangle(this.x, this.y, this.width, this.height, this.backColor);
        }
    }

    protected calculateLocalTransform() {
        return (this.firstChild && (this.x !== 0 || this.y !== 0) ) ? Matrix4.translation(this.x, this.y, 0) : null
    }

    _localTransform?: Matrix4 | null
    get localTransform() {
        if (!this.localTransformValid) {
            this._localTransform = this.calculateLocalTransform()
            this.localTransformValid = true
        }
        return this._localTransform
    }

    protected drawChildren(g: Graphics) {
        if (this.firstChild) {
            this.layoutChildren(this)
            // alter this to use an actual full transform matrix or not
            let saveTransform = g.transform
            g.transform = this.worldTransform
            super.draw(g)
            g.transform = saveTransform
        }
    }

    get size() { return new Size(this.width, this.height) }
    set size(value) {
        this.width = value.width
        this.height = value.height
    }
    get bounds() { return new Rectangle(this.x, this.y, this.width, this.height) }
    set bounds(value) {
        this.x = value.x
        this.y = value.y
        this.width = value.width
        this.height = value.height
    }
    get position() { return new Vector3(this.x, this.y) }
    set position(value) {
        this.x = value.x
        this.y = value.y
    }

    _pickable?: Pickable
    get pickable() {
        let value = this._pickable
        if (value == null) {
            value = Pickable.children
            if (this.backColor.isVisible) {
                value |= Pickable.self
            }
        }
        return value

    }
    set pickable(value: Pickable) {
        this._pickable = value
    }

    //  pick children in reverse because we render the latter ones on top of the former
    protected get pickChildrenReverse() { return true }
    pickSelf(ray: Capsule) {
        if (this.pickRadius) {
            ray = ray.addRadius(this.pickRadius)
        }
        let intersection = this.bounds.intersectsCapsule(ray)
        return intersection ? new PickResult(this, intersection) : null
    }

}
