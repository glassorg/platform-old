import Key, { ModelKey } from "../../data/Key";
import Dependent from "../../data/Dependent";
import Store from "../../data/Store";

export type Pointer = {
    id: number
    screenX: number
    screenY: number
    pressure: number
}

function addPointer(e: PointerEvent) {
    let pointer: Pointer = { id: e.pointerId, screenX: e.screenX, screenY: e.screenY, pressure: e.pressure }
    if (pointer.pressure > 0) {
        Store.default.patch(PointerState.key, { pointers: { [e.pointerId]: pointer } })
    }
}

function removePointer(e: PointerEvent) {
    Store.default.patch(PointerState.key, { pointers: { [e.pointerId]: null } })
}

@Dependent.class()
export default class PointerState extends Dependent {

    @Dependent.property()
    pointers!: { [id: string]: Pointer }

    static key = Key.create(PointerState)
    static watched(key: ModelKey<PointerState>) {
        let element = window.document
        element.addEventListener("pointerdown", addPointer)
        element.addEventListener("pointermove", addPointer)
        element.addEventListener("pointercancel", removePointer)
        return () => {
            element.removeEventListener("pointerdown", addPointer)
            element.removeEventListener("pointermove", addPointer)
            element.removeEventListener("pointercancel", removePointer)
        }
    }

}