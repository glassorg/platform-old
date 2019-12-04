
import Model, { ModelClass } from "../Model"
import Query, { createPredicate, createSortCompareFunction } from "../Query"
import Key, { ModelKey, SearchKey } from "../Key"
import Store from "../Store"

type Predicate<T> = (value: T) => boolean

export default class Table<T extends Model = Model> {

    public readonly key: SearchKey<T>
    private filter: Predicate<T>
    private keys: Map<string, ModelKey<T>> = new Map()
    private cachedKeys: Array<ModelKey<T>> | null = null

    constructor(key: SearchKey<T>) {
        this.key = key
        this.filter = createPredicate(key.query)
    }

    invalidateCachedKeys() {
        this.cachedKeys = null
    }

    getKeyIterator() {
        return this.keys.values()
    }

    createSortedKeys(store: Store): Array<ModelKey<T>> {
        if (this.key.query.sort == null || this.key.query.sort.length === 0)
            return Array.from(this.getKeyIterator())

        //  get value for each key
        let values: T[] = []
        let valueToKeyMap = new Map<T, ModelKey<T>>()
        for (let key of this.getKeyIterator()) {
            let value = store.peek(key)
            if (value) {
                values.push(value)
                valueToKeyMap.set(value, key)
            }
        }
        //  sort values
        values.sort(createSortCompareFunction(this.key.query))
        //  convert back to keys and return
        return values.map(t => valueToKeyMap.get(t)!)
    }

    getKeys(store: Store) {
        if (this.cachedKeys == null)
            this.cachedKeys = this.createSortedKeys(store)
        return this.cachedKeys
    }

    update(key: ModelKey<T>, record: T | null): boolean {
        if (record != null) {
            if (this.key.isPossibleMatch(key) && this.filter(record)) {
                if (!this.keys.has(key.string)) {
                    this.invalidateCachedKeys()
                    this.keys.set(key.string, key)
                    return true
                }
            } else {
                record = null
            }
        }

        if (record == null && this.keys.has(key.string)) {
            this.invalidateCachedKeys()
            this.keys.delete(key.string)
            return true
        }
        return false
    }

}