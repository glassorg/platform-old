import Query, { isQuery } from "./Query"
import Model, { ModelClass, ModelSchema } from "./Model"
import Namespace, { isNamespace } from "./Namespace"
import { deepFreeze, isPlainObject, isEmptyObject } from "../utility/common"
import State, { StateSchema, StateClass } from "./State"
import defaultNamespace from "./defaultNamespace"
import * as JSONPointer from "./JSONPointer"
import Patch, { createPatch } from "./Patch"

export type SearchKey<T = any> = Key<T> & { id: null, query: Query<T> }
export type ModelKey<T = any> = Key<T> & { id: string, query: null }
export type StateKey<T = any> = ModelKey<T> & { schema: { default: T } }

const emptyQuery = Object.freeze({})

function match(regex, map, text): { parent?: string, type?: string, id?: string, query?: string | any  } | null {
    let result = regex.exec(text)
    if (result == null) {
        return null
    }
    let object = {}
    for (let key in map) {
        let index = map[key]
        let value = result[index]
        if (value != null) {
            object[key] = value
        }
    }
    return object
}

//                  (parent                    )     (type      )   (id       )       (query )
const keyRegex = /^((([^\/\?#]+\/[^\/\?#]+\/?)+)\/)?(([^\/\?#]+)(\/([^\/\?#]*))?)?(\?(.*))?$/i
const keyMap = {
    parent: 2,
    type: 5,
    id: 7,
    query: 9
}

function parse(key): { parent?: string, type?: string, id?: string, query?: any } {
    let result = match(keyRegex, keyMap, key)
    if (result == null) {
        throw new Error(`Invalid key: ${key}`)
    }
    let { query } = result
    if (query) {
        if (query[0] === "{") {
            try {
                result.query = JSON.parse(query)
            } catch (e) {
                throw new Error(`Invalid key query: ${key}, ${e}`)
            }
        }
        else {
            result.query = { path: JSONPointer.parse(query) }
        }
    }
    return result
}

function stringify(steps: any[]) {
    let buffer: string[] = []
    for (let step of steps) {
        if (Array.isArray(step)) {
            // ?path/to/a/field => { path: ["path", "to", "a", "field"] }
            step = { pointer: step }
        }

        if (isPlainObject(step)) {
            //  query
            buffer.push("?", JSON.stringify(step))
        }
        else if (step != null) {
            if (buffer.length > 0) {
                buffer.push("/")
            }
            if (Model.isSchema(step)) {
                buffer.push(step.name)
            } else {
                buffer.push(step.toString())
            }
        }
    }
    return buffer.join("")
}

export default class Key<T = any> {

    public static isProbablyModelKey(value: string): boolean {
        if (value == null)
            return false
        let slashes = 0
        let slashCode = "/".charCodeAt(0)
        for (let i = 0; i < value.length; i++) {
            if (value.charCodeAt(i) === slashCode)
                slashes++
        }
        return (slashes % 2 === 1) && keyRegex.test(value)
    }

    public static isSearchKey(value): value is SearchKey {
        return value instanceof Key && value.id == null
    }
    public static isModelKey(value): value is ModelKey {
        return value instanceof Key && value.id != null
    }

    public readonly parent: ModelKey | null
    public readonly schema: ModelSchema<T>
    public readonly type: ModelClass<T> | null
    public readonly id: string | null
    public readonly query: Query<T>
    public readonly string: string
    public readonly path: string

    private constructor(
        parent: ModelKey | null = null,
        schema: ModelSchema<T> | null = null,
        id: string | null = null,
        query: Query<T> | null = null,
        string: string = stringify([parent, schema, id, query])
    ) {
        // if parent is missing
        if (!Model.isSchema(schema)) {
            throw new Error("Type is not a valid model class: " + schema)
        }
        this.parent = parent
        this.schema = schema
        this.type = Model.isClass<T>(schema) ? schema : null
        this.id = id
        this.query = query != null ? query : emptyQuery
        this.string = string
        this.path = this.schema.name
        if (this.id) {
            this.path += "/" + this.id
        }
        if (this.parent) {
            this.path = this.parent.path + "/" + this.path
        }

        Object.freeze(this)
    }

    static create<T = Model>(type: ModelClass<T>, id: string, path?: JSONPointer.default): ModelKey<T>
    static create<T = Model>(type: ModelSchema<T>, id: string, path?: JSONPointer.default): ModelKey<T>
    static create<T = Model>(type: ModelClass<T>, query: Query<T>): SearchKey<T>
    static create<T extends State>(type: StateClass<T>, id: string, path?: JSONPointer.default): StateKey<T>
    static create<T = Model>(type: StateSchema<T>, id: string, path?: JSONPointer.default): StateKey<T>
    static create<T = Model>(type: StateSchema<T>, query: Query<T>): StateKey<T>
    static create<T = Model, P = Model>(parent: ModelKey<P>, type: ModelSchema<T>, id: string, path?: JSONPointer.default): ModelKey<T>
    static create<T = Model, P = Model>(parent: ModelKey<P>, type: ModelClass<T>, id: string, path?: JSONPointer.default): ModelKey<T>
    static create<T = Model, P = Model>(parent: ModelKey<P>, type: ModelClass<T>, query: Query<T>): SearchKey<T>
    static create<T = Model>(...args): Key<T> {
        let parent: ModelKey | null = null
        let schema: ModelSchema<T> | null = null
        let id: string | null = null
        let query: Query<T> | null = null
        let i = 0
        if (Key.isModelKey(args[i])) {
            parent = args[i++]
        }
        if (Model.isSchema(args[i])) {
            schema = args[i++]
        }
        else {
            throw new Error("Type is not a valid model class: " + args[i])
        }
        if (typeof args[i] === "string") {
            id = args[i++]
        }
        if (isPlainObject(args[i])) {
            query = args[i++]
        }
        if (Array.isArray(args[i])) {
            query = { path: args[i++] }
        }
        return new Key(parent, schema, id, query)
    }

    static parse(key: string): ModelKey 
    static parse(type: ModelClass,  id: string): Key
    static parse(type: ModelClass,  id: Query): Key
    static parse(parent: Key, type: ModelClass,  id: string): Key
    static parse(parent: Key, type: ModelClass,  id: Query): Key
    static parse(namespace: Namespace, key: string): Key
    static parse(namespace: Namespace, type: ModelClass,  id: string): Key
    static parse(namespace: Namespace, type: ModelClass,  id: Query): Key
    static parse(namespace: Namespace, parent: Key, type: ModelClass,  id: string): Key
    static parse(namespace: Namespace, parent: Key, type: ModelClass,  id: Query): Key
    static parse(...steps: Array<Namespace | Key | ModelClass | string | Query>): Key
    static parse(...steps: Array<Namespace | Key | ModelClass | string | Query>): Key {
        //  get namespace, possibly consuming first step
        let namespace: Namespace
        let first = steps[0]
        if (isNamespace(first)) {
            namespace = first
            steps.shift()
        }
        else {
            namespace = defaultNamespace
        }

        //  get the text of the key
        let text = stringify(steps)

        //  parse it
        let props = parse(text)

        //  pull out the properties
        let parent: ModelKey | null = null
        let type: ModelClass
        let id: string | null = null
        let query: Query | null = null
        if (props.type) {
            let foundType = namespace[props.type]
            if (foundType == null) {
                // console.log({ props, text, steps, namespace })
                throw new Error(`Type not found in namespace: ${props.type}. Did you forget @Model.register()`)
            }
            type = foundType
        } else {
            throw new Error("Type is required")
        }
        if (props.parent) {
            parent = Key.parse(namespace, props.parent) as ModelKey
        }
        if (props.query) {
            //  TODO: Really should completely normalize query
            //  so that equivalent queries always match string format
            if (props.query && isEmptyObject(props.query.where)) {
                delete props.query.where
            }
            query = deepFreeze(props.query)
        }
        if (props.id) {
            id = props.id
        }

        return new Key(parent, type, id, query)
    }

    get(model: T) {
        return JSONPointer.get(model, this.query.path)
    }

    /**
     * Creates a patch using the query.path and the value.
     */
    patch(value): Patch<T>
    /**
     * Applies a patch to the model using the query.path and the value.
     */
    patch(model: T, value): T
    patch(modelOrValue: T | any, value?) {
        if (arguments.length == 1) {
            return createPatch(this.query.path, modelOrValue)
        }
        else {
            return JSONPointer.patch(modelOrValue, this.query.path, value)
        }

    }

    isPossibleMatch(this: SearchKey<T>, key: ModelKey<T>): boolean {
        return this.type === key.type
            && (this.parent && this.parent.string) === (key.parent && key.parent.string)
    }

    toString() {
        return this.string
    }

    toJSON() {
        return this.string
    }

    static readonly regex = keyRegex

}
