import Query, { isQuery } from "./Query";
import Model, { ModelClass, ModelSchema } from "./Model";
import Namespace, { isNamespace } from "./Namespace";
import { deepFreeze, isPlainObject, isEmptyObject } from "../utility/common";
import State, { StateSchema, StateClass } from "./State";

export type QueryKey<T = any> = Key<T> & { id: null, query: Query<T> }
export type ModelKey<T = any> = Key<T> & { id: string, query: null }
export type StateKey<T = any> = ModelKey<T> & { schema: { default: T } }

function match(regex, map, text): { parent?: string, type?: string, id?: string, query?: string } | null {
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
const keyRegex = /^((([^\/\?#]+\/[^\/\?#]+\/?)+)\/)?(([^\/\?#]+)(\/([^\/\?#]*))?)?(\?(\{.*\}))?$/i
const keyMap = {
    parent: 2,
    type: 5,
    id: 7,
    query: 9
}

function parse(key): { parent?: string, type?: string, id?: string, query?: any } {
    let result = match(keyRegex, keyMap, key)
    if (result == null) {
        throw new Error("invalid key: {{key}}")
    }
    if (result.query) {
        try {
            result.query = JSON.parse(result.query)
        } catch (e) {
            throw new Error("invalid key query: {{key}}, {{e}}")
        }
    }
    return result
}

function stringify(steps: any[]) {
    let buffer: string[] = []
    for (let step of steps) {
        if (isPlainObject(step)) {
            buffer.push("?", JSON.stringify(step))
        } else if (step != null) {
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

    public static isQueryKey(value): value is QueryKey {
        return value instanceof Key && value.query != null
    }
    public static isModelKey(value): value is ModelKey {
        return value instanceof Key && value.id != null
    }

    public readonly parent: ModelKey | null
    public readonly schema: ModelSchema<T>
    public readonly type: ModelClass<T> | null
    public readonly id: string | null
    public readonly query: Query<T> | null
    public readonly string: string
    public readonly path: string

    private constructor(
        parent: ModelKey | ModelSchema<T> | null = null,
        schema: ModelSchema<T> | string | Query<T> | null = null,
        idOrQuery: string | Query<T> | null = null,
        string: string = stringify([parent, schema, idOrQuery])
    ) {
        // if parent is missing
        if (Model.isSchema(parent)) {
            idOrQuery = schema as Query<T>
            schema = parent
            parent = null
        }
        if (!Model.isSchema(schema))
            throw new Error("Type is not a valid model class: " + schema)
        let id = typeof idOrQuery === "string" ? idOrQuery : null
        let query = id != null ? null : (idOrQuery as Query<T> || {})
        this.parent = parent
        this.schema = schema
        this.type = Model.isClass<T>(schema) ? schema : null
        this.id = id
        this.query = query
        this.string = string
        this.path = this.schema.name
        if (this.id)
            this.path += "/" + this.id
        if (this.parent)
            this.path = this.parent.path + "/" + this.path

        Object.freeze(this)
    }

    static create<T extends State>(type: StateClass<T>): StateKey<T>
    static create<T = Model>(type: StateSchema<T>): StateKey<T>
    static create<T = Model>(type: ModelSchema<T>): ModelKey<T>
    static create<T = Model>(type: ModelClass<T>, id: string): ModelKey<T>
    static create<T = Model>(type: ModelSchema<T>, id: string): ModelKey<T>
    static create<T = Model>(type: ModelClass<T>, query: Query<T>): QueryKey<T>
    static create<T = Model>(type: StateSchema<T>, id: string): StateKey<T>
    static create<T = Model, P = Model>(parent: ModelKey<P>, type: ModelClass<T>, id: string): ModelKey<T>
    static create<T = Model, P = Model>(parent: ModelKey<P>, type: ModelClass<T>, query: Query<T>): QueryKey<T>
    static create<T = Model>(parentOrType: ModelKey<T> | ModelSchema<T>, typeOrQueryOrId: ModelSchema<T> | Query<T> | string = "", idOrQuery?: Query<T> | string): Key<T> {
        return new Key(parentOrType, typeOrQueryOrId, idOrQuery)
    }

    static parse(namespace: Namespace, ...steps: Array<Key | ModelClass | string | Query>) {
        //  get namespace, possibly consuming first step
        if (!isNamespace(namespace)) {
            throw new Error("Namespace or Key is required")
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
            if (props.query && isEmptyObject(props.query.where))
                delete props.query.where
            query = deepFreeze(props.query)
        }
        if (props.id) {
            id = props.id
        }

        return new Key(parent, type, id || query, text)
    }

    isPossibleMatch(this: QueryKey<T>, key: ModelKey<T>): boolean {
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
