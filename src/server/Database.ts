import Key, { ModelKey, QueryKey } from "../data/Key"
import Entity from "../data/Entity"
import Namespace from "../data/Namespace";

/**
 * Low level database interface.
 * Does NOT provide security, stamping or schema validation.
 * All of those features will be implemented at a higher, database agnostic level.
 */
abstract class Database {

    public readonly namespace!: Namespace

    constructor(namespace: Namespace) {
        this.namespace = namespace;
    }

    abstract get<T extends Entity = Entity>(keys: ModelKey<T>[]): Promise<Array<T | null>>
    abstract query<T extends Entity = Entity>(key: QueryKey<T>): Promise<T[]>
    async all<T extends Entity = Entity>(keys: Array<ModelKey<T>[] | QueryKey<T>>): Promise<T[][]> {
        return Promise.all(keys.map(key => Key.isModelKey(key) ? this.get([key]) : this.query(key as QueryKey)))
    }
    abstract put(values: Entity | Entity[]): Promise<void>

}

export default Database
