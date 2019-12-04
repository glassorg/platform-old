import Key, { ModelKey, SearchKey } from "../Key"
import Store, { Listener, Value } from "../Store"
import Model from "../Model"

/**
 * Base class for ModelSource implementations.
 * Also can serve as a simple in memory model source.
 */
export default class CompositeStore extends Store {

    stores: { [name: string]: Store }

    constructor(stores: { [name: string]: Store } ) {
        super()
        this.stores = stores
    }

    private getStore(key: Key): Store {
        let store = this.stores[key.schema.store || "memory"]
        if (store == null)
            throw new Error(`Store not found: ${name}`)
        return store
    }

    addReadListener(listener: Listener) {
        for (let name in this.stores)
            this.stores[name]!.addReadListener(listener)
    }

    removeReadListener(listener: Listener) {
        for (let name in this.stores)
            this.stores[name]!.removeReadListener(listener)
    }

    addWriteListener(listener: Listener) {
        for (let name in this.stores)
            this.stores[name]!.addWriteListener(listener)
    }

    removeWriteListener(listener: Listener) {
        for (let name in this.stores)
            this.stores[name]!.removeWriteListener(listener)
    }

    get<T = Model>(key: ModelKey<T>, peek?: boolean): T | null | undefined
    get<T = Model>(key: SearchKey<T>, peek?: boolean): Array<ModelKey<T>> | undefined
    get(key: Key, peek: boolean = false): Value | undefined {
        return this.getStore(key).get(key, peek)
    }

    ensureWatched(key: Key) {
        return this.getStore(key).ensureWatched(key)
    }

    removeWatched(key: Key) {
        return this.getStore(key).removeWatched(key)
    }

    patch(key: ModelKey, value: any) {
        this.getStore(key).patch(key, value)
    }

}
