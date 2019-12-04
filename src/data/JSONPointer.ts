import { createPatch } from "./Patch"
import clonePatch from "../utility/clonePatch"

function unescape(sequence: "~0" | "~1") {
    return sequence === "~0" ? "~" : "/"
}

function decode(step: string) {
    return step.replace(/~[01]/g, unescape as any)
}

function escape(sequence: "~" | "/") {
    return sequence === "~" ? "~0" : "~1"
}

function encode(step: string | number) {
    return typeof step === "number" ? step : step.replace(/[~\/]/g, escape as any)
}

type JSONPointer = Readonly<Array<string | number>>
export default JSONPointer

const emptyArray = Object.freeze([])

export function parse(jsonPointer: string): JSONPointer {
    if (jsonPointer == null || jsonPointer.length === 0) {
        return emptyArray
    }
    let steps = jsonPointer.split("/").map(decode)
    if (steps[0] === "") {
        steps.shift();
    }
    return steps
}

export function stringify(pointer: JSONPointer) {
    return pointer.length === 0 ? "" : "/" + pointer.map(encode).join("/")
}

export function get(document, pointer: JSONPointer = emptyArray) {
    let value = document
    for (let i = 0; value != null && i < pointer.length; i++) {
        value = value[pointer[i]]
    }
    return value
}

export function set(document, pointer: JSONPointer = emptyArray, value) {
    if (pointer.length === 0) {
        return value
    }
    
    let target = document
    for (let i = 0; target != null && i < pointer.length - 1; i++) {
        target = target[pointer[i]]
    }
    if (target != null) {
        let lastStep = pointer[pointer.length - 1]
        if (value == null) {
            delete target[lastStep]
        }
        else {
            target[lastStep] = value
        }
    }
    return document

}

export function patch(document, pointer: JSONPointer = emptyArray, value) {
    return pointer.length === 0 ? value : clonePatch(document, createPatch(pointer, value))
}