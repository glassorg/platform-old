import Capsule from "../../math/Capsule"
import PointerTarget from "../../PointerTarget"

// export function isPickable(value): value is Pickable {
//     return value != null && typeof value.pick === "function"
// }

// export default interface Pickable extends PointerTarget {

//     pick(ray: Capsule): Pickable | null

// }

enum Pickable {
    None = 0,
    Self = 1,
    Children = 2,
}
export default Pickable