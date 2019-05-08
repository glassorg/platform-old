import Capsule from "../../math/Capsule";

export function isPickable(value): value is Pickable {
    return value != null && typeof value.pick === "function"
}

export default interface Pickable {

    pick(ray: Capsule): Pickable | null
    onmouseover?: (e: MouseEvent) => void
    onmouseout?: (e: MouseEvent) => void
    onmousemove?: (e: MouseEvent) => void
    onmousedown?: (e: MouseEvent) => void
    onmouseup?: (e: MouseEvent) => void
    onclick?: (e: MouseEvent) => void

}