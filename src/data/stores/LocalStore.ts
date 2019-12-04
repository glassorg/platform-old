import Key, { SearchKey, ModelKey } from "../Key"
import MemoryStore from "./MemoryStore"
import { Value } from "../Store"
import Model, { ModelSchema } from "../Model"
import Serializer from "../Serializer"

//  local stores extend memory stores and then operate as a write-through cache
//  we DO NOT watch the localStorage object in realtime.
export default class LocalStore extends MemoryStore {

    private storage: Storage
    private serializer: Serializer
    private loaded = new Set<ModelSchema | string>()

    constructor(storage: Storage = localStorage, serializer: Serializer = Model.serializer) {
        super()
        this.serializer = serializer
        this.storage = storage
    }

    ensureLoaded(key: Key) {
        let checkLoadedKey = Key.isSearchKey(key) ? key.schema : key.string
        if (!this.loaded.has(checkLoadedKey)) {
            this.loaded.add(checkLoadedKey)
            if (Key.isModelKey(key)) {
                let value = this.storage.getItem(key.string)
                if (value != null) {
                    let model = this.serializer.parse(value)
                    this.setValue(key, model)
                }
            } else {
                let filter = key.schema.name + "/"
                // iterate all keys and try to load values
                for (let i = 0; i < this.storage.length; i++) {
                    let keyString = this.storage.key(i)
                    if (keyString !== null && keyString.startsWith(filter) && Key.isProbablyModelKey(keyString)) {
                        try {
                            let modelKey = this.serializer.key(keyString)
                            this.ensureLoaded(modelKey)
                        } catch (e) {
                            // console.warn(e)
                            console.warn(`Deleting invalid key (${keyString})`)
                            // storage.removeItem(keyString)
                        }
                    }
                }
            }
        }
    }

    get(key: Key, peek: boolean = false): Value | undefined {
        this.ensureLoaded(key)
        return super.get(key as any, peek)
    }

    protected setValue(key: Key, value: Value) {
        let changed = super.setValue(key, value)
        // we only store model keys in local storage, never query keys
        if (changed && Key.isModelKey(key)) {
            if (value != null) {
                if (key.type != null && value.constructor !== key.type)
                    value = new key.type(value as any)
                this.storage.setItem(key.string, this.serializer.stringify(value as Model))
            } else {
                this.storage.removeItem(key.string)
            }
        }
        return changed
    }

}
