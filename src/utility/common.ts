import { Schema } from "../data/schema"

export function isPrimitive(value): value is null | undefined | number | boolean | string | (() => any) {
    return value == null || typeof value !== "object"
}

export function isPlainObject(value) {
    return value != null && value.constructor === Object
}

export function isEmptyObject(value) {
    for (let property in value) {
        return false
    }
    return true
}

export function deepFreeze(value) {
    if (!isPrimitive(value)) {
        for (let property in value) {
            deepFreeze(value[property])
        }
        Object.freeze(value)
    }
    return value
}

//  maps an objects values to a new object similar to array.map
export function map(collection: object | any[], convert: (item, index) => any) {
    if (Array.isArray(collection))
        return collection.map(convert)
    let result: any = {}
    for (let name in collection) {
        result[name] = convert(collection[name], name)
    }
    return result
}

export function memoize<A extends (arg) => any>(fn: A, cache: Map<any, any> = new Map()): A {
    return (function(this, arg) {
        let result = cache.get(arg)
        if (result === undefined) {
            cache.set(arg, result = fn.apply(this, arguments as any))
        }
        return result
    } as any as A)
}

export function getPath(ancestor, descendant): string[] | null {
    if (ancestor === descendant) {
        return []
    }
    if (ancestor && typeof ancestor === "object") {
        for (let name in ancestor) {
            let child = ancestor[name]
            let path = getPath(child, descendant)
            if (path != null) {
                return [name, ...path]
            }
        }
    }
    return null
}

type Callback = (value: any, schema: Schema, ancestors: any[], path: any[]) => void
export function traverse(value, schema: Schema, callback: Callback, ancestors: any[] = [], path: any[] = []) {
    callback(value, schema, ancestors, path)
    // traverse any children.
    if (value != null && typeof value === "object") {
        if (Array.isArray(value)) {
            if (schema.items) {
                ancestors.push(value)
                for (let i = 0; i < value.length; i++) {
                    let itemSchema = Array.isArray(schema.items) ? (schema.items[i] || schema.additionalItems) : schema.items
                    if (itemSchema) {
                        path.push(i)
                        traverse(value[i], itemSchema, callback, ancestors, path)
                        path.pop()
                    }
                }
                ancestors.pop()
            }
        }
        else {
            ancestors.push(value)
            for (let name in value) {
                let propertySchema = schema.properties && schema.properties[name] || schema.additionalProperties && schema.additionalProperties
                if (propertySchema) {
                    path.push(name)
                    traverse(value[name], propertySchema, callback, ancestors, path)
                    path.pop()
                }
            }
            // also traverse any schema properties that we didn't get in 
            if (schema.properties) {
                for (let name in schema.properties) {
                    if (!value.hasOwnProperty(name)) {
                        let propertySchema = schema.properties[name]
                        if (propertySchema) {
                            path.push(name)
                            traverse(value[name], propertySchema, callback, ancestors, path)
                            path.pop()
                        }
                    }
                }
            }
            ancestors.pop()
        }
    }
}

export function argmax<T>(values: T[], func: (value: T) => number) {
    if (values.length == 0)
        throw new Error("Values must be non-empty.")
    let indexOfMax = 0
    let max = func(values[0])
    for (let i = 1; i < values.length; i++) {
        let value = func(values[i])
        if (value > max) {
            indexOfMax = i
            max = value
        }
    }
    return {
        index: indexOfMax,
        value: max,
        argument: values[indexOfMax]
    }
}