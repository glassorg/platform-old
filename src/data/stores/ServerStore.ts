import Key, { SearchKey, ModelKey } from "../Key"
import MemoryStore from "./MemoryStore"
import { Value } from "../Store"
import Model, { ModelSchema } from "../Model"
import Serializer from "../Serializer"
import invoke from "../../server/invoke"
import Entity from "../Entity"

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

        let handleEntities = (entities: Entity[]) => {
            // now... do we store individual query results, or entire result sets?
            // for now let's just store the whole value till we can analyze
            for (let entity of entities) {
                this.watched.add(entity.key.string)
                super.setValue(entity.key, entity)
            }
            if (Key.isSearchKey(key) && key.query != null && key.query.limit != null) {
                let keys = entities.map(entity => entity.key)
                super.setValue(key, keys)
            }
            if (Key.isModelKey(key) && entities.length == 0) {
                super.setValue(key, null)
            }
        }

        console.log(`ensureLoaded ${key}`)

        if (Key.isSearchKey(key)) {
            const rowDelimiter = "\n"
            let url = `${this.path}/query/${key}`
            let xhr = new XMLHttpRequest()
            let read = 0
            let entities: Entity[] = []
            let tryRead = () => {
                let text = xhr.responseText
                let rowEnd = text.lastIndexOf(rowDelimiter)
                // console.log('tryRead', {rowEnd})
                if (rowEnd > 0) {
                    // console.log("next", { read, rowEnd })
                    let unread = text.slice(read, rowEnd)
                    if (unread.length > 0) {
                        read = rowEnd
                        let serializedRows = unread.trim().split(rowDelimiter)
                        entities.push(...serializedRows.map(raw => Model.serializer.parse(raw)))
                        // console.log("Deserialize: " + serializedRows.length)
                    }
                }
            }
            xhr.onprogress = tryRead
            xhr.onload = () => {
                tryRead()
                handleEntities(entities)
            }
            xhr.open("GET", url)
            xhr.responseType = "text"
            xhr.send()
        } else {
            invoke<string[],Entity[][]>(`${this.path}/get`, [key.toString()]).then(result => {
                let entities = result[0]
                handleEntities(entities)
            }, reason => {
                console.log("Invoke get error", reason)
            })
        }
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

            invoke(`${this.path}/patch`, { [key.toString()]: value }).then(result => {
                console.log("patch?", result)
            }, reason => {
                console.log("Invoke patch error", reason)
            })
        }
        return changed
    }

}
