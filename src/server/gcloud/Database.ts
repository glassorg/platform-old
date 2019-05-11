import Key, { ModelKey, QueryKey } from "../../data/Key"
import Entity from "../../data/Entity"

/**
 * Low level database interface.
 * Does NOT provide security, stamping or schema validation.
 * All of those features will be implemented at a higher, database agnostic level.
 */
interface Database {
    //  get
    get<T extends Entity>(key: ModelKey<T>): Promise<T | null>
    //  query
    query<T extends Entity>(key: QueryKey<T>): Promise<T[]>
    //  create, update, delete
    put(values: Entity[]): Promise<void>
}

export default Database
