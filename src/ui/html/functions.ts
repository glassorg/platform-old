import INode from "../INode";
import Vector2 from "../math/Vector2";
import Context from "../Context";

export function getClientPosition(element: HTMLElement) {
    let bounds = element.getClientRects()[0]
    return new Vector2(bounds.left, bounds.top)
}

export function getPosition(e: MouseEvent, element: HTMLElement = e.target as HTMLElement) {
    let bounds = element.getClientRects()[0]
    return new Vector2(e.clientX - bounds.left, e.clientY - bounds.top)
}

export function isAncestorOrSelf(self: INode, possibleAncestor: INode) {
    for (let node: INode | null = self; node != null; node = node.parentNode) {
        if (node === possibleAncestor) {
            return true
        }
    }
    return false
}

export function getAncestor(element: HTMLElement, predicate: (ancestor: HTMLElement) => boolean) {
    for (let ancestor = element.parentElement; ancestor != null; ancestor = ancestor.parentElement) {
        if (predicate(ancestor)) {
            return ancestor
        }
    }
    return null
}

export function getFormValues(element: HTMLFormElement) {
    let values: any = {}
    // TODO: improve this to query from some class indicator of field
    for (let input of element.querySelectorAll("input")) {
        values[input.name] = input.value
    }
    return values
}

function isForm(element: HTMLElement) {
    return element instanceof HTMLFormElement
}

export function getAncestorForm(element: HTMLElement): HTMLFormElement | null {
    return getAncestor(element, isForm) as HTMLFormElement | null
}

function getEventListenerTarget(name: string) {
    if (name === "window") {
        return window
    }
    if (name === "document") {
        return window.document
    }
    if (name === "body") {
        return window.document.body
    }
    if (name === "this") {
        return Context.current.lastNode
    }
    if (name === "parent") {
        return Context.current.lastNode!.parentNode
    }
    let element = document.querySelector(name)
    if (element == null) {
        throw new Error(`Query element not found: ${name}`)
    }
    return element
}

function bindEventListenersInternal(listeners, add = true, boundTargets: any = {}) {
    for (let targetName in listeners) {
        let target = boundTargets[name]
        if (target == null) {
            target = boundTargets[name] = getEventListenerTarget(targetName)
        }
        let targetEventListeners = listeners[targetName]
        for (let eventName in targetEventListeners) {
            let eventListener = targetEventListeners[eventName]
            target[add ? "addEventListener" : "removeEventListener"](eventName, eventListener)
        }
    }
    return boundTargets
}

/**
 * Adds all of the event listeners to their respective elements
 * and returns a function which will unbind them all.
 */
export function bindEventListeners(listeners): () => void {
    let boundTargets = bindEventListenersInternal(listeners, true)
    return () => {
        bindEventListenersInternal(listeners, false, boundTargets)
    }
}