import Key, { SearchKey, ModelKey, StateKey } from "./Key"
import Model from "./Model"
import State from "./State"
import DefaultStore from "./stores/DefaultStore"
import Patch from "./Patch"

export type Value = Key[] | Model | any | null
export type Listener = (key: Key) => void
export type Unwatch = () => void

/**
 * Store is the low level asynchronous model saving and loading interface.
 */
export default abstract class Store {

    abstract addReadListener(listener: Listener): void
    abstract removeReadListener(listener: Listener): void
    abstract addWriteListener(listener: Listener): void
    abstract removeWriteListener(listener: Listener): void
    abstract ensureWatched<T = Model>(key: Key<T>): boolean
    abstract removeWatched<T = Model>(key: Key<T>): boolean
    peek<T extends State>(key: ModelKey<T>): T
    peek<T = Model>(key: StateKey<T>): T
    peek<T = Model>(key: ModelKey<T>): T | null | undefined
    peek<T = Model>(key: SearchKey<T>): Array<ModelKey<T>> | undefined
    peek<T = Model>(key: Key<T>): T | null | Array<ModelKey<T>> | undefined {
        return this.get(key, true)
    }
    abstract get<T extends State>(key: ModelKey<T>, peek?: boolean): T
    abstract get<T = Model>(key: StateKey<T>, peek?: boolean): T
    abstract get<T = Model>(key: ModelKey<T>, peek?: boolean): T | null | undefined
    abstract get<T = Model>(key: SearchKey<T>, peek?: boolean): Array<ModelKey<T>> | undefined
    abstract get<T = Model>(key: Key<T>, peek?: boolean): T | null | Array<ModelKey<T>> | undefined
    abstract patch<T extends string | boolean | number>(key: ModelKey<T>, value: T | null): void
    abstract patch<T>(key: ModelKey<T>, value: Patch<T>): void

    delete<T = Model>(keys: ModelKey<T>[]): void
    delete<T = Model>(key: ModelKey<T>): void
    delete<T = Model>(key: SearchKey<T>): void
    delete<T = Model>(key: Key<T> | ModelKey<T>[]): void {
        if (Key.isSearchKey(key)) {
            key = this.get(key)!
            if (key == null) {
                throw new Error("Could not get keys to delete")
            }
        }
        if (Array.isArray(key)) {
            for (let k of key) {
                this.patch(k as any, null)
            }
        } else {
            this.patch(key as any, null)
        }
    }

    list<T = Model>(key: SearchKey<T>, peek?: boolean): T[] | undefined {
        let items: T[] = []
        let keys = this.get(key, peek)
        if (keys == null) {
            return undefined
        }
        for (let itemKey of keys) {
            let item = this.get(itemKey, peek)
            if (item != null) {
                items.push(item)
            }
        }
        return items
    }

    private watchers?: Map<string, Set<any>>
    private watchListener(key) {
        let value: any = this.peek(key)
        if (value === undefined) {
            value = null
        }
        let watchers = this.watchers!.get(key.string)
        if (watchers != null) {
            for (let watcher of watchers.values()) {
                let value: any = this.peek(key)
                if (value === undefined) {
                    value = null
                }
                watcher(value != null ? value : null)
            }
        }
    }

    watch<T = Model>(key: ModelKey<T>, callback: (value: T | null) => void): Unwatch
    watch<T = Model>(key: SearchKey<T>, callback: (value: Array<ModelKey<T>>) => void): Unwatch
    watch<T = Model>(key: Key<T>, callback: (value: T | null | Array<ModelKey<T>>) => void): Unwatch {
        if (this.watchers == null) {
            this.watchers = new Map()
            this.addWriteListener(this.watchListener.bind(this))
        }

        let keyWatchers = this.watchers.get(key.string)
        if (keyWatchers == null) {
            this.watchers.set(key.string, keyWatchers = new Set())
        }
        keyWatchers.add(callback)

        let value = this.peek(key as any)
        if (value !== undefined) {
            callback(value as any)
        }

        return () => {
            keyWatchers!.delete(callback)
        }
    }

    private static _default: DefaultStore
    static get default(): DefaultStore {
        if (Store._default == null) {
            //  need to dynamically require
            //  because otherwise there is a dependency loop
            Store._default = require("./stores/DefaultStore").create()
        }
        return Store._default
    }

}
