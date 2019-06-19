import Key, { ModelKey, QueryKey } from "../../data/Key"
import Entity from "../../data/Entity"
import Namespace from "../../data/Namespace";

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

    async get<T extends Entity>(key: ModelKey<T>): Promise<T | null> {
        let results = await this.all([key])
        return results[0][0] as T || null
    }

    async query<T extends Entity>(key: QueryKey<T>): Promise<T[]> {
        let results = await this.all([key])
        return results[0] as T[]
    }

    abstract all(keys: Key[]): Promise<Entity[][]>
    abstract put(values: Entity | Entity[]): Promise<void>

}

export default Database
