import Key from "./Key"

function pretraverse(key, object, visitor) {
    for (let childKey in object) {
        let value = object[childKey]
        if (value && typeof value === "object") {
            let change = pretraverse(childKey, value, visitor)
            if (value !== change) {
                object[childKey] = change
            }
        }
    }
    object = visitor(key, object)
    return object
}

export const typeKey = ""
export const countKey = "$"
//  we are not using the JSON replacer or reviver because our minimal traversal is more efficent
//  when parsing and we need a custom traversal when stringifying
export default class Serializer {

    private indent: number
    public readonly namespace

    constructor(namespace = {}, options: { indent?: number } = {}) {
        this.namespace = namespace
        this.indent = options.indent || 0
        this.parse = this.parse.bind(this)
        this.stringify = this.stringify.bind(this)
    }

    public key(keyString: string): Key {
        return Key.parse(this.namespace, keyString)
    }

    public parse(text: string) {
        let { namespace } = this
        // this pretraversal revive function is much faster than using the built in JSON.parse reviver
        let root = JSON.parse(text)
        function pretraverse(key, object) {
            let typeName = object[typeKey]
            let childCount = object[countKey] || 0
            if (typeName == null || childCount > 0) {
                for (let childKey in object) {
                    let value = object[childKey]
                    if (value && typeof value === "object") {
                        let change = pretraverse(childKey, value)
                        if (value !== change) {
                            object[childKey] = change
                        }
                    }
                }
            }
            if (typeName) {
                delete object[typeKey]
                delete object[countKey]
                let modelConstructor = namespace[typeName]
                if (modelConstructor == null) {
                    console.log("********************************************")
                    console.log(Object.keys(namespace).join(" : "))
                    console.log("********************************************")
                    throw new Error(`Class not found in namespace: ${typeName}`)
                }
                object = new modelConstructor(object)
            }
            return object
        }
    
        return pretraverse("", root)
    }

    public stringify(root) {
        let { namespace } = this
        let encodedTypeCount = 0
        function pretraverse(key, object) {
            if (object.toJSON) {
                return object.toJSON()
            }
            // we CAN NOT mutate the input object so we will copy it
            let output = Array.isArray(object) ? object.slice(0) : { ...object }
            let initialTypeCount = encodedTypeCount
            for (let childKey in object) {
                let value = object[childKey]
                if (value && typeof value === "object") {
                    output[childKey] = pretraverse(childKey, value)
                }
            }
            if (object != null && typeof object === "object" && namespace.hasOwnProperty(object.constructor.name)) {
                let encodedChildrenCount = encodedTypeCount - initialTypeCount
                let modelConstructor = object.constructor
                output = { [typeKey]: modelConstructor.name, ...output }
                if (encodedChildrenCount > 0) {
                    output[countKey] = 1
                }
            }
            return output
        }
        root = pretraverse("", root)
        return JSON.stringify(root, null, this.indent > 0 ? this.indent : undefined)
    }

    public register(name: string, type) {
        this.namespace[name] = type
    }

    public static readonly default = new Serializer()

}
