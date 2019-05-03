
import { isPrimitive, isPlainObject, isEmptyObject } from "./common"

//  shallow clone, doesn't preserve type
function clone(value) {
    if (isPrimitive(value)) {
        return value
    }
    if (Array.isArray(value)) {
        return value.slice(0)
    }
    return Object.assign({}, value)
}

function clonePatch(target, patch) {
    if (!isPlainObject(patch)) {
        return patch
    }
    if (isEmptyObject(patch)) {
        return target
    }
    if (isPrimitive(target)) {
        target = {}
    }

    let cloneValues = clone(target)
    for (let property in patch) {
        let newValue = clonePatch(target[property], patch[property])
        if (newValue != null) {
            cloneValues[property] = newValue
        } else {
            delete cloneValues[property]
        }
    }
    if (Array.isArray(target) || isPlainObject(target)) {
        return cloneValues
    }
    return new target.constructor(cloneValues)
}

export default clonePatch
