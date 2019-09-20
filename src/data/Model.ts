import { Schema, Properties } from "./schema"
import validate from "./schema/validate"
import * as Serializer from "./Serializer"
import isDebug from "../isDebug"

export type ModelConstructor<T> = new (propertiesArray: Array<{ [name: string]: any }>) => T
export type ModelSchema<T = any> = Schema & { name: string, store?: string }
export type ModelClass<T = Model> = ModelConstructor<T> & ModelSchema<T>

/**
 * Base class for validated, immutable, objects.
 */
export default class Model {

    public static isClass<T>(value): value is ModelClass<T> {
        return typeof value === "function" && value.name && value.properties != null
    }

    public static isSchema(value): value is ModelSchema {
        return value != null && typeof value.name === "string" && typeof value.store === "string"
    }

    static readonly store: string = "session"
    static readonly properties: Properties = {}

    constructor(...propertiesArray: Array<{ [name: string]: any }>) {
        let definedProperties: Properties = (this.constructor as any).properties
        for (let properties of propertiesArray) {
            for (let name in properties) {
                let value = properties[name]
                let definedProperty = definedProperties[name]
                if (definedProperty && definedProperty.coerce != null) {
                    value = definedProperty.coerce.call(this, value)
                }
                if (Model.ValidateAndFreezeOnConstruction) {
                    Object.freeze(value)
                }
                if (definedProperty == null || definedProperty.default != /* deliberately untruthy */ value) {
                    this[name] = value
                }
            }
        }

        if (Model.ValidateAndFreezeOnConstruction) {
            this.validate()
            Object.freeze(this)
        }
    }

    static ValidateAndFreezeOnConstruction = typeof window !== "undefined"

    validate() {
        let errors = validate(this.constructor as Schema, this, this, [this.constructor.name])
        if (errors.length > 0) {
            throw new Error(errors.join(",\n"))
        }
    }

    //  Model class decorator 
    static class(...values: Schema[]) {
        return function(target) {
            //  register this Model for serialization
            Model.serializer.register(target.name, target)
            //  copy all schema properties to it.
            Object.assign(target, ...values)
            return target
        }
    }

    //  Model property decorator
    static property(...values: Schema[]) {
        let value = Object.assign({}, ...values)
        // infer type from value if present
        if (value.default && !value.type) {
            value.type = typeof value.default as any
        }
        return function(target, propertyName) {
            // overwrite the name in a local copy of the value.
            // we don't change it in the passed in values objects as they may
            // be reused as schema args for different properties
            value = Object.assign({}, value, { name: propertyName })

            // ensure properties are extended from prototype class properties
            if (!target.constructor.hasOwnProperty("properties"))
                target.constructor.properties = Object.create(target.__proto__.constructor.properties)
            let properties = target.constructor.properties

            if (properties == null) {
                throw new Error(`${target.constructor.name} is missing a properties object to contain schema definition for ${propertyName}`)
            }
            if (value.hasOwnProperty("default")) {
                target[propertyName] = Object.freeze(value.default)
            }
            properties[propertyName] = value
        }
    }

    private static _serializer: Serializer.default
    public static get serializer() {
        if (Model._serializer == null) {
            Model._serializer = new Serializer.default()
        }
        return Model._serializer
    }

}
Object.freeze(Model.properties)