import Key, { SearchKey, ModelKey } from "../Key"
import Model from "../Model"
import clonePatch from "../../utility/clonePatch"
import Store, { Listener, Value } from "../Store"
import Namespace from "../Namespace"
import Table from "./Table"
import validate from "../schema/validate"

/**
 * Base class for ModelSource implementations.
 * Also can serve as a simple in memory model source.
 */
export default class MemoryStore extends Store {

    private readonly tables: Map<string, Table> = new Map()
    private readonly keys = new Map<string, Key>()
    private readonly values = new Map<string, Value>()
    private readonly writeListeners = new Set<Listener>()
    private readonly readListeners = new Set<Listener>()
    protected readonly watched = new Set<string>()

    private getTable(key: SearchKey) {
        let table = this.tables.get(key.string)
        if (table == null) {
            table = new Table(key)
            for (let modelKey of this.keys.values()) {
                if (Key.isModelKey(modelKey)) {
                    if (key.isPossibleMatch(modelKey)) {
                        let model = this.peek(modelKey) as Model | null
                        if (model == null)
                            throw new Error(`Model is missing for key: ${modelKey}`)
                        table.update(modelKey, model)
                    }
                }
            }
            this.tables.set(key.string, table)
        }
        return table
    }

    addReadListener(listener: Listener) {
        this.readListeners.add(listener)
    }

    removeReadListener(listener: Listener) {
        this.readListeners.delete(listener)
    }

    addWriteListener(listener: Listener) {
        this.writeListeners.add(listener)
    }

    removeWriteListener(listener: Listener) {
        this.writeListeners.delete(listener)
    }

    get<T = Model>(key: ModelKey<T>, peek?: boolean): T | null | undefined
    get<T = Model>(key: SearchKey<T>, peek?: boolean): Array<ModelKey<T>> | undefined
    get(key: Key, peek: boolean = false): Value | undefined {
        // if it's a query make sure we have the corresponding table tracking changes
        if (!peek) {
            this.notify(key, this.readListeners)
            this.ensureWatched(key)
        }
        let value = this.values.get(key.string)
        // if a ModelClass provides a default value we return that when no value is present.
        if (value == null) {
            // if it's a query key not explicitly cached then we create it.
            if (Key.isSearchKey(key)) {
                return this.getTable(key).getKeys(this)
            }
            value = key.schema.default || value
        }
        return value
    }

    ensureWatched(key: Key) {
        if (this.watched.has(key.string))
            return false
        this.watched.add(key.string)
        return true
    }

    removeWatched(key: Key) {
        return this.watched.delete(key.string)
    }

    patch(key: ModelKey, value: any) {
        if (!Key.isModelKey(key))
            throw new Error("Invalid EntityKey: " + key)
        let newValue = clonePatch(this.get(key, true), value)
        if (key.type == null && value != null) {
            // if the key has a type then that validates on construction
            // otherwise we need to validate the value here.
            let errors = validate(key.schema, value)
            if (errors.length > 0) {
                throw new Error(`validation of ${key.string} failed:\n${errors.join("\n")}`)
            }
        }
        this.setValue(key, newValue)
    }

    protected setValue(key: Key, value: Value) {
        let currentValue = this.values.get(key.string)
        if (value === currentValue) {
            return false
        }

        if (Key.isModelKey(key)) {
            if (value != null && key.type != null && value.constructor !== key.type) {
                value = new key.type(value as any)
            }
            if (!this.keys.has(key.string)) {
                this.keys.set(key.string, key)
            }
            for (let table of this.tables.values()) {
                if (table.update(key, value as Model | null)) {
                    this.notify(table.key, this.writeListeners)
                }
            }
        }
        this.values.set(key.string, value)
        this.notify(key, this.writeListeners)
        return true
    }

    private notify(key: Key, listeners: Set<Listener>) {
        for (let listener of listeners)
            listener(key)
    }

}
