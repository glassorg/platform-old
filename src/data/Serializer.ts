import Key from "./Key"
import { Schema } from "./schema";
import { memoize } from "../utility/common";

function compressNames(type: Schema, values) {
    // name compression is temporarily disabled.
    // if (type.properties) {
    //     let original = values
    //     values = {}
    //     for (let name in original) {
    //         let property = type.properties[name]
    //         let id = property && property.id || name
    //         if (values.hasOwnProperty(id)) {
    //             throw new Error(`${type.name} has colliding property ids: ${id}`)
    //         }
    //         values[id] = original[name]
    //     }
    // }
    return values
}
let getIdToNameLookup = memoize(properties => {
    let map: any = {}
    for (let name in properties) {
        let property = properties[name]
        let id = property && property.id || name
        map[id] = name
        map[name] = name
    }
    return map
})
function uncompressNames(type: Schema, values) {
    if (type.properties) {
        let idToName = getIdToNameLookup(type.properties)
        let original = values
        values = {}
        for (let id in original) {
            let name = idToName[id]
            if (name == null) {
                throw new Error(`${type.name} property id '${id}' not found`)
            }
            let property = type.properties[name]
            if (original.hasOwnProperty(id)) {
                values[name] = original[id]
            } else if (original.hasOwnProperty(name)) {
                // this allows you to add id's later and still deserialize values without id
                values[name] = original[name]
            }
        }
    }
    return values
}

export const typeKey = ""
export default class Serializer {

    private replacer: (key: string, value: any) => any
    private reviver: (key: string, value: any) => any
    private indent: number
    public readonly namespace
    public readonly compress: boolean

    constructor(namespace = {}, options: { indent?: number, compress?: boolean } = {}) {
        let compress = this.compress = options.compress != null ? options.compress : true
        this.namespace = namespace
        this.indent = options.indent || 0
        this.replacer = function(key: string, value: any) {
            if (value != null && typeof value === "object" && namespace.hasOwnProperty(value.constructor.name)) {
                let modelConstructor = value.constructor
                if (compress) {
                    value = compressNames(modelConstructor, value)
                }
                return { [typeKey]: modelConstructor.name, ...value }
            }
            return value
        }
        this.reviver = function(key: string, value: any) {
            if (value != null && typeof value === "object" && value.hasOwnProperty(typeKey)) {
                let name = value[typeKey]
                delete value[typeKey]
                let modelConstructor = namespace[name]
                if (modelConstructor == null) {
                    console.log("********************************************")
                    console.log(Object.keys(namespace).join(" : "))
                    console.log("********************************************")
                    throw new Error(`Class not found in namespace: ${name}`)
                }
                if (compress) {
                    value = uncompressNames(modelConstructor, value)
                }
                return new modelConstructor(value)
            }
            return value
        }
        this.parse = this.parse.bind(this)
        this.stringify = this.stringify.bind(this)
    }

    public key(keyString: string): Key {
        return Key.parse(this.namespace, keyString)
    }

    public parse(text: string) {
        return JSON.parse(text, this.reviver)
    }

    public stringify(object) {
        return JSON.stringify(object, this.replacer, this.indent > 0 ? this.indent : undefined)
    }

    public register(name: string, type) {
        this.namespace[name] = type
    }

    public static readonly default = new Serializer()

}
