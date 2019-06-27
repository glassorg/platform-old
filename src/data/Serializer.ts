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
            let childCount = object[countKey] || 0
            if (childCount > 0) {
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
            if (object && object[typeKey]) {
                let name = object[typeKey]
                delete object[typeKey]
                delete object[countKey]
                let modelConstructor = namespace[name]
                if (modelConstructor == null) {
                    console.log("********************************************")
                    console.log(Object.keys(namespace).join(" : "))
                    console.log("********************************************")
                    throw new Error(`Class not found in namespace: ${name}`)
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
            let initialTypeCount = encodedTypeCount
            for (let childKey in object) {
                let value = object[childKey]
                if (value && typeof value === "object") {
                    let change = pretraverse(childKey, value)
                    if (value !== change) {
                        object[childKey] = change
                    }
                }
            }
            if (object != null && typeof object === "object" && namespace.hasOwnProperty(object.constructor.name)) {
                let encodedChildrenCount = encodedTypeCount - initialTypeCount
                let modelConstructor = object.constructor
                object = { [typeKey]: modelConstructor.name, ...object }
                if (encodedChildrenCount > 0) {
                    object[countKey] = 1
                }
            }
            return object
        }
        root = pretraverse("", root)
        return JSON.stringify(root, null, this.indent > 0 ? this.indent : undefined)
    }

    public register(name: string, type) {
        this.namespace[name] = type
    }

    public static readonly default = new Serializer()

}
