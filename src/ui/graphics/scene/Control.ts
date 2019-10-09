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
import TextureBase from "../TextureBase"
import Graphics3D from "../Graphics3D"

type LayoutFunction = (container: Control) => void

export default class Control extends Node {

    private _x = 0
    private _y = 0
    width = 100
    height = 50
    backgroundColor?: Color
    backgroundImage?: string | TextureBase
    color = Color.black
    margin = Spacing.zero
    padding = Spacing.zero
    pickRadius?: number
    minimumSize?: Size
    maximumSize?: Size
    optimumSize?: Size
    private transformValid?: boolean

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
            this.transformValid = false
            this._x = value
        }
    }
    get x() {
        return this._x
    }
    set y(value) {
        if (this._y !== value) {
            this.transformValid = false
            this._y = value
        }
    }
    get y() {
        return this._y
    }

    draw(g: Graphics) {
        this.drawBackground(g)
        super.draw(g)
    }

    protected drawBackground(g: Graphics) {
        if (this.backgroundColor || this.backgroundImage) {
            g.fillRectangle(0, 0, this.width, this.height, this.backgroundColor || Color.white, this.backgroundImage);
        }
    }

    protected calculateLocalTransform() {
        return (this.x !== 0 || this.y !== 0) ? Matrix4.translation(this.x, this.y, 0) : null
    }

    _transform?: Matrix4 | null
    get transform() {
        if (!this.transformValid) {
            this._transform = this.calculateLocalTransform()
            this.transformValid = true
        }
        return this._transform
    }

    updateChildren(g: Graphics) {
        this.layoutChildren(this)
        return super.updateChildren(g)
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
    get boundingShape() { return new Rectangle(0, 0, this.width, this.height) }

    get isVisible() {
        return this.backgroundImage || (this.backgroundColor && this.backgroundColor.isVisible)
    }

    _pickable?: Pickable
    get pickable() {
        let value = this._pickable
        if (value == null) {
            value = Pickable.children
            if (this.isVisible) {
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
        let intersection = this.boundingShape.intersectsCapsule(ray)
        return intersection ? new PickResult(this, intersection) : null
    }

}
