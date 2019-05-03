import { Type, Schema } from "./Schema"
import { getSubSchema } from "./functions";

function isValidType(type: Type, value): boolean {
    if (typeof type === "string") {
        let actualType = typeof value
        switch (type) {
            case "array": return Array.isArray(value)
            case "integer": return actualType === "number" && Number.isInteger(value)
            case "null": return value == null
            default: return actualType === type
        }
    } else {
        return type === value.constructor
    }
}

function isValidPattern(pattern: string | RegExp, value: string) {
    let regex = typeof pattern === "string" ? new RegExp(pattern) : pattern
    let result = regex.exec(value)
    if (!result || result[0].length !== value.length)
        return false
    return true
}

export default function validate(schema: Schema, value, root = value, path: string[] = [], errors: string[] = []) {
    let { type, properties, format, pattern, required = false } = schema
    let { minimum, maximum, minLength, maxLength, minItems, maxItems } = schema
    if (value === undefined) {
        if (required)
            errors.push(`${path.join(".")} is required`)
    } else {
        if (schema.validate) {
            let result = schema.validate.call(root, value)
            let success = result === undefined || result === true
            if (!success) {
                let message = typeof result === "string" ? result : `${path.join(".")} failed custom validate`
                errors.push(message)
            }
        }
        if (schema.not && validate(schema.not, value, root, path).length === 0)
            errors.push(`${path.join(".")} matched a not schema`)
        if (schema.allOf)
            throw new Error("Schema.allOf is not implemented")
        if (schema.anyOf)
            throw new Error("Schema.anyOf is not implemented yet")
        if (type != null) {
            if (Array.isArray(type)) {
                let valid = false
                for (let item of type) {
                    if (isValidType(item, value)) {
                        valid = true
                        break
                    }
                }
                if (!valid) {
                    errors.push(`${path.join(".")} is not valid type: ${type.join('|')}`)
                }
            } else if (!isValidType(type, value)) {
                errors.push(`${path.join(".")} is not valid type: ${type}`)
            }
        }
        if (value != null) {
            if (properties) {
                //  iterate each property in the definition
                for (let key in properties) {
                    let propertySchema = properties[key] || schema.additionalProperties
                    path.push(key)
                    if (propertySchema) {
                        validate(propertySchema, value[key], root, path, errors)
                    }
                    path.pop()
                }
                //  iterate each property in the value
                for (let key in value) {
                    let propertySchema = properties[key]
                    if (propertySchema)
                        continue // we already tested this
                    propertySchema = schema.additionalProperties
                    path.push(key)
                    if (!propertySchema) {
                        errors.push(`additional properties are not allowed: (${path.join(".")})`)
                    } else {
                        validate(propertySchema, value[key], root, path, errors)
                    }
                    path.pop()
                }
            }
            if (schema.const && schema.const !== value)
                errors.push(`${path.join(".")} (${value}) is not required value: ${schema.const}`)
            if (schema.enum && !schema.enum.includes(value))
                errors.push(`${path.join(".")} (${value}) is not a member of enum.`)            
            if (typeof value === "number") {
                if (minimum !== undefined && value < minimum)
                errors.push(`${path.join(".")} (${value}) is less than minimum: ${minimum}`)
                if (maximum !== undefined && value > maximum)
                errors.push(`${path.join(".")} (${value}) is greater than: ${maximum}`)
            } else if (typeof value === "string") {
                if (pattern && !isValidPattern(pattern, value))
                    errors.push(`${path.join(".")} (${value}) is not valid pattern: ${pattern}`)
                if (minLength !== undefined && value.length < minLength)
                    errors.push(`${path.join(".")} (${value}) is shorter than: ${minLength}`)
                if (maxLength !== undefined && value.length > maxLength)
                    errors.push(`${path.join(".")} (${value}) is longer than: ${maxLength}`)
            } else if (Array.isArray(value)) {
                if (minItems !== undefined && value.length < minItems)
                    errors.push(`${path.join(".")} (${value}) contains fewer items than: ${minItems}`)
                if (maxItems !== undefined && value.length > maxItems)
                    errors.push(`${path.join(".")} (${value}) contains more items than: ${maxItems}`)
                if (schema.items || schema.additionalItems) {
                    for (let i = 0; i < value.length; i++) {
                        let itemSchema = getSubSchema(schema, i)
                        path.push(String(i))
                        if (itemSchema) {
                            validate(itemSchema, value[i], root, path, errors)
                        } else {
                            //  in a restriction beyond spec, we require a valid schema for additionalItems
                            //  if items array is specified
                            errors.push(`${path.join(".")} does not allow additional items`)
                        }
                        path.pop()
                    }
                }
            }
        }
    }

    return errors
}