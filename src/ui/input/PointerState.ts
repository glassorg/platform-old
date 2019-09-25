import Key, { ModelKey } from "../../data/Key"
import Dependent from "../../data/Dependent"
import Store from "../../data/Store"
import { Schema } from "../../data/schema"
import Vector2 from "../math/Vector2"
import Patch from "../../data/Patch"
import clonePatch from "../../utility/clonePatch"
import Point from "./Point"

const maxPoints = 200

function updatePointer(e: PointerEvent) {
    if (e.buttons > 0) {
        let id = e.pointerId
        let type = e.pointerType as any
        let isPrimary = e.isPrimary
        let key = Key.create(PointerState, id.toString())
        let point = new Point(e)
        let state = Store.default.peek(key)
        let points = state && state.points.slice(Math.max(0, state.points.length - maxPoints)) || []
        points.push(point)
        Store.default.patch(key, { id, type, isPrimary, points })
    }
}

function cancelPointer(e: PointerEvent) {
    let key = Key.create(PointerState, e.pointerId.toString())
    Store.default.delete(key)
}

let watching = false

@Dependent.class()
export default class PointerState extends Dependent {

    @Dependent.property({ default: 0 })
    id!: number

    @Dependent.property({ default: "mouse" })
    type!: "mouse" | "pen" | "touch"

    @Dependent.property({ default: true })
    isPrimary!: boolean

    @Dependent.property({ required: true, type: "array", default: [] })
    points!: Point[]

    @Dependent.property({ default: null, description: `
        The id of the gesture for handling this pointers input.
    ` })
    handler!: string | null

    get first() {
        return this.points[0]
    }

    get last() {
        return this.points[this.points.length - 1]
    }

    get key() {
        return Key.create(PointerState, this.id.toString())
    }

    /**
     * Returns a unit Vector2 pointing in the direction from the start to the last point.
     */
    get direction() {
        return this.last.position.subtract(this.first.position).normalize()
    }

    /**
     * Returns the distance as the crow flies from the start to the last point.
     */
    get distance() {
        return this.last.position.subtract(this.first.position).length()
    }

    /**
     * Returns the total distance from start to finish following through all of the points.
     */
    get length() {
        let length = 0
        let lastPosition: Vector2 | null = null
        for (let { position } of this.points) {
            if (lastPosition != null) {
                length += position.subtract(lastPosition).length()
            }
            lastPosition = position
        }
        return length
    }

    /**
     * Returns the total time from start to finish of this path.
     */
    get duration() {
        return this.last.time - this.first.time
    }

    patch(delta: Patch<PointerState>) {
        let patched = clonePatch(this, delta)
        if (patched !== this) {
            Store.default.patch(this.key, patched)
        }
        return patched
    }

    static watched(key: ModelKey<PointerState>) {
        if (!watching) {
            watching = true
            let element = window.document
            element.addEventListener("pointerdown", updatePointer)
            element.addEventListener("pointermove", updatePointer)
            element.addEventListener("pointerup", cancelPointer)
            element.addEventListener("pointercancel", cancelPointer)
            return () => {
                element.removeEventListener("pointerdown", updatePointer)
                element.removeEventListener("pointermove", updatePointer)
                element.removeEventListener("pointerup", cancelPointer)
                element.removeEventListener("pointercancel", cancelPointer)
                watching = false
            }
        }
        else {
            return () => {}
        }
    }

    static readonly all = Key.create(PointerState, {})

}