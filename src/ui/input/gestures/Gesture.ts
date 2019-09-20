import PointerState from "../PointerState"
import GestureMatcher from "./GestureMatcher"
import PointerMatcher from "./PointerMatcher"

type GestureHandler = (pointers: PointerState[]) => void
type PointerHandler = (pointer: PointerState) => void

type Gesture = {
    //  must match in order to start handling the gesture
    start: GestureMatcher
    onStart?: GestureHandler
    add?: PointerMatcher
    onAdd?: PointerHandler
    remove?: PointerMatcher
    onRemove?: PointerHandler
    finish?: GestureMatcher
    onFinish?: GestureHandler
    onUpdate?: GestureHandler
}

export default Gesture