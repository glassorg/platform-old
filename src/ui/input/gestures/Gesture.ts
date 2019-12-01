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
    finish?: (pointers: PointerState[]) => boolean
    onFinish?: GestureHandler
    onUpdate?: GestureHandler
    share?: { [gestureId: string]: boolean }
    steal?: string[]
    capture?: boolean
    captureElement?: Element
}

export default Gesture