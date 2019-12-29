import defaultNamespace from "./defaultNamespace"

// function pretraverse(key, object, visitor) {
//     for (let childKey in object) {
//         let value = object[childKey]
//         if (value && typeof value === "object") {
//             let change = pretraverse(childKey, value, visitor)
//             if (value !== change) {
//                 object[childKey] = change
//             }
//         }
//     }
//     object = visitor(key, object)
//     return object
// }

function getId(constructor) {
    return constructor.id ?? constructor.name
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

    public parse(text: string | object) {
        let { namespace } = this
        // this pretraversal revive function is much faster than using the built in JSON.parse reviver
        let root = typeof text === "object" ? text : JSON.parse(text)
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
                if (modelConstructor.parse) {
                    object = modelConstructor.parse(object)
                }
                else {
                    object = new modelConstructor(object)
                }
            }
            return object
        }
    
        if (root != null && typeof root === "object") {
            root = pretraverse("", root)
        }
        return root
    }

    public stringify(root) {
        root = this.toJSON(root)
        return JSON.stringify(root, null, this.indent > 0 ? this.indent : undefined)
    }

    public toJSON(root: any) {
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
            let id = getId(object.constructor)
            if (object != null && typeof object === "object" && namespace.hasOwnProperty(id)) {
                let encodedChildrenCount = encodedTypeCount - initialTypeCount
                encodedTypeCount++
                let modelConstructor = object.constructor
                output = { [typeKey]: getId(modelConstructor), ...output }
                if (encodedChildrenCount > 0) {
                    output[countKey] = 1
                }
            }
            return output
        }
        if (root != null && typeof root === "object") {
            root = pretraverse("", root)
        }
        return root
    }

    public register(name: string, type) {
        this.namespace[name] = type
    }

    public static readonly default = new Serializer(defaultNamespace)

}
