import Key, { QueryKey, ModelKey } from "../Key";
import MemoryStore from "./MemoryStore";
import { Value } from "../Store";
import Model, { ModelSchema } from "../Model";
import Serializer from "../Serializer";
import invoke from "../../server/invoke";
import Entity from "../Entity";

//  Query results
//      limit ? -> cache results
//      else -> just store values

export default class ServerStore extends MemoryStore {

    private path: string
    private serializer: Serializer

    constructor(path: string = "/api/data", serializer: Serializer = Model.serializer) {
        super()
        this.path = path
        this.serializer = serializer
    }

    ensureWatched(key: Key) {
        if (!super.ensureWatched(key)) {
            return false
        }

        console.log(`ensureLoaded ${key}`)
        invoke<string[],Entity[][]>(`${this.path}/get`, [key.toString()]).then(result => {
            let entities = result[0]
            // now... do we store individual query results, or entire result sets?
            // for now let's just store the whole value till we can analyze
            for (let entity of entities) {
                this.watched.add(entity.key.string)
                super.setValue(entity.key, entity)
            }
            if (Key.isQueryKey(key) && key.query != null && key.query.limit != null) {
                let keys = entities.map(entity => entity.key)
                super.setValue(key, keys)
            }
            if (Key.isModelKey(key) && entities.length == 0)
                super.setValue(key, null)
        }, reason => {
            console.log("Invoke get error", reason)
        })
        return true
    }

    protected setValue(key: Key, value: Value) {
        let changed = super.setValue(key, value)
        // we only store model keys in local storage, never query keys
        if (changed && Key.isModelKey(key)) {
            // mark this entity as watched
            this.watched.add(key.toString());
            if (value != null) {
                if (key.type != null && value.constructor !== key.type) {
                    value = new key.type(value as any)
                }
            } else {
                throw new Error("No deleting yet")
            }

            invoke(`${this.path}/put`, { [key.toString()]: value }).then(result => {
                console.log("put?", result)
            }, reason => {
                console.log("Invoke put error", reason)
            })
        }
        return changed
    }

}
