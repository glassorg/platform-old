import GestureMatcher from "./GestureMatcher"
import PointerMatcher from "./PointerMatcher"
import PointerState from "../PointerState"
import Vector2 from "../../math/Vector2"
import Gesture from "./Gesture"
import Gestures from "./Gestures"
import Store from "../../../data/Store"
import { bindEventListeners } from "../../html/functions"
import GestureState from "./GestureState"
import Key from "../../../data/Key"

type Matcher = GestureMatcher | PointerMatcher

export function and(...matchers: PointerMatcher[]): PointerMatcher {
    return (pointer) => matchers.every(matcher => matcher(pointer))
}

export function or(matchers: PointerMatcher[]): PointerMatcher
export function or(matchers: GestureMatcher[]): GestureMatcher
export function or(matchers: Matcher[]): Matcher {
    return (pointers) => {
        let result: any
        for (let matcher of matchers) {
            result = matcher(pointers)
            if (result) {
                return result
            }
        }
        return Array.isArray(result) ? result : false
    }
}

export function not(a: PointerMatcher): PointerMatcher {
    return (pointer) => !a(pointer)
}

export function move(min: number, max?: number): PointerMatcher {
    return (pointer) => {
        let distance = pointer.last.position.subtract(pointer.first.position).length()
        return distance >= min && (max == null || distance <= max)
    }
}

export function direction(vector: Vector2, minDotProduct: number = 0.9): PointerMatcher {
    return (pointer) => {
        return pointer.last.position.subtract(pointer.first.position).normalize().dot(vector) >= minDotProduct
    }
}

export const always: PointerMatcher = (pointer) => true
export const never: PointerMatcher = (pointer) => false

export function any(match: PointerMatcher): GestureMatcher {
    return (pointers) => {
        let matched: PointerState[] = []
        for (let pointer of pointers) {
            if (match(pointer)) {
                matched.push(pointer)
            }
        }
        return matched
    }
}

export function all(match: PointerMatcher): GestureMatcher {
    return (pointers) => {
        return any(match)(pointers).length === pointers.length ? pointers : []
    }
}

export function oneForAll(match: PointerMatcher): GestureMatcher {
    return (pointers) => {
        return any(match)(pointers).length > 0 ? pointers : []
    }
}

export function recognize(gestures: Gestures) {
    type Pointers = { [name: string]: PointerState }
    // crap, what is the correct way to bind these event listeners?
    let timeoutId: any = null
    function update() {
        timeoutId = null
        let pointers = Store.default.list(PointerState.all)!

        let uncapturedPointers = pointers.filter(p => p.handler == null)

        for (let gestureId in gestures) {
            let gesture = gestures[gestureId]
            let gestureKey = Key.create(GestureState, gestureId)
            let gestureState = Store.default.get(gestureKey)
            let captured = pointers.filter(p => p.handler === gestureId)
            //  capture a pointer to the current gesture
            function capture(pointer: PointerState) {
                // actually capture pointer
                let element = pointer.first.target as HTMLElement
                element.setPointerCapture(pointer.id)
                uncapturedPointers.splice(uncapturedPointers.indexOf(pointer), 1)
                captured.push(pointer.patch({ handler: gestureId }))
            }
            //  release a pointer from the current gesture
            function release(pointer: PointerState) {
                let element = pointer.first.target as HTMLElement
                element.releasePointerCapture(pointer.id)
                captured.splice(captured.indexOf(pointer), 1)
                uncapturedPointers.push(pointer.patch({ handler: null }))
            }
            //  if this gesture hasn't started (captured any pointers)
            if (captured.length == 0) {
                gesture.start(uncapturedPointers).slice(0).forEach(capture)
                if (captured.length > 0 && gesture.onStart) {
                    gesture.onStart(captured)
                }
            }
            if (captured.length > 0) {
                //  maybe add some new pointers to the gesture handler
                if (gesture.add) {
                    for (let pointer of uncapturedPointers) {
                        if (gesture.add(pointer)) {
                            capture(pointer)
                        }
                    }
                }
                //  maybe remove some old pointers from the gesture handler
                if (gesture.remove) {
                    for (let pointer of captured) {
                        if (gesture.remove(pointer)) {
                            release(pointer)
                        }
                    }
                }
                //  now lets update
                if (captured.length > 0) {
                    if (gesture.onUpdate) {
                        gesture.onUpdate(captured)
                    }
                }
            }
            if (captured.length === 0) {
                //  if there aren't any captured pointers, call finish
                let previous = gestureState.captured
                if (previous.length > 0) {
                    //  this gesture handler had pointers before but doesn't now
                    //  so we call finish with the final pointers
                    if (gesture.onFinish) {
                        gesture.onFinish(previous)
                    }
                }
            }
            Store.default.patch(gestureKey, { captured })
        }
    }
    function queueUpdate() {
        if (timeoutId == null) {
            timeoutId = setTimeout(update, 0)
        }
    }
    return {
        pointerdown: queueUpdate,
        pointermove: queueUpdate,
        pointerup: queueUpdate,
        pointercancel: queueUpdate,
    }
}

/**
 *  binds these gestures to listen for activation on the window
 *  and returns a function which can be called to unbind them.
 *  This will often be used as the return value from a Component
 *  that needs gesture recognition.
 */
export function bind(gestures: Gestures) {
    return bindEventListeners({
        window: recognize(gestures)
    })
}