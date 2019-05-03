import Namespace from "./Namespace"
import Model, { ModelClass } from "./Model"
import Key from "./Key"

const typeKey = ""
export default class Serializer {

    private replacer: (key: string, value: any) => any
    private reviver: (key: string, value: any) => any
    private indent: number
    public readonly namespace: Namespace

    constructor(namespace: Namespace = {}, indent: number = 0) {
        this.namespace = namespace
        this.replacer = function(key: string, value: any) {
            if (value != null && typeof value === "object" && namespace.hasOwnProperty(value.constructor.name)) {
                return Object.assign({ [typeKey]: value.constructor.name }, value)
            }
            return value
        }
        this.reviver = function(key: string, value: any) {
            if (value != null && typeof value === "object" && value.hasOwnProperty(typeKey)) {
                let name = value[typeKey]
                delete value[typeKey]
                let modelConstructor = namespace[name]
                if (modelConstructor == null) {
                    throw new Error(`Class not found in namespace: ${name}`)
                }
                return new modelConstructor(value)
            }
            return value
        }
        this.indent = indent
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

    public register(name: string, type: ModelClass) {
        this.namespace[name] = type
    }

}
