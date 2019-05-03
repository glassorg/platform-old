import Key from "../../data/Key"
import Entity from "../../data/Entity"

/**
 * Low level database interface.
 * Does NOT provide security, stamping or schema validation.
 * All of those features will be implemented at a higher, database agnostic level.
 */
interface IDatabase {
    //  retrieve
    get(keys: Key[]): Promise<Entity[][]>
    //  create, update, delete
    put(values: Entity[]): Promise<void>
}

export default IDatabase
