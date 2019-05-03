import { Schema } from "./Schema";

function getSubSchemaInternal(schema: Schema, property: string | number | Array<string | number>): Schema | undefined {
    if (schema != null && property != null) {
        if (Array.isArray(property)) {
            for (let step of property) {
                schema = getSubSchemaInternal(schema, step)!
                if (schema == null) {
                    break
                }
            }
            return schema
        } else {
            if (schema.properties) {
                let subSchema = schema.properties[property]
                if (subSchema) {
                    return subSchema
                }
            }
            if (schema.additionalProperties) {
                return schema.additionalProperties
            }
            if (schema.items) {
                if (Array.isArray(schema.items)) {
                    let subSchema = schema.items[property]
                    if (subSchema) {
                        return subSchema
                    }
                } else {
                    return schema.items
                }
            }
        }
    }
    return undefined
}

export function getSubSchema(schema: Schema, property: string | number | Array<string | number>): Schema | undefined {
    property = getArrayIfPropertyIsDotDelimitedPath(property)
    return getSubSchemaInternal(schema, property)
}


function getValueInternal(object, property: string | number | Array<string | number>) {
    if (object == null || property == null) {
        return undefined
    }

    if (Array.isArray(property)) {
        for (let step of property) {
            object = object[step]
            if (object == null) {
                break
            }
        }
        return object
    } else {
        return object[property]
    }
}

function getArrayIfPropertyIsDotDelimitedPath(property: string | number | Array<string | number>) {
    if (typeof property === "string") {
        if (property.indexOf(".") >= 0) {
            property = property.split(".")
        }
    }
    return property
}

export function getValue(object, property: string | number | Array<string | number>) {
    property = getArrayIfPropertyIsDotDelimitedPath(property)
    return getValueInternal(object, property)
}
