import Key, { SearchKey, ModelKey } from "../Key"
import MemoryStore from "./MemoryStore"
import { Value } from "../Store"
import Serializer from "../Serializer"
import Namespace from "../Namespace"
import Record from "../../data/Record"
import * as common from "../../utility/common"
import {Firestore as GoogleFirestore, Query as GoogleQuery, WhereFilterOp} from "@google-cloud/firestore"
import { Schema } from "../../data/schema"

export const serializedProperty = "_"

export type Snapshot = {
    data(): any
    ref: { path: string }
    exists: boolean
}

export function getIndexedValues(entity: Record) {
    let values: any = {}
    let deleted = entity.deleted != null
    common.traverse(entity, entity.constructor as Schema, (value, schema, ancestors, path) => {
        if (schema.index && (!deleted || path[0] === "deleted")) {
            //  initially we used ".", but that prevents queries from working
            //  in google firestore
            let name = path.join("_")
            values[name] = value
        }
    })
    return values
}

const getSerializer = common.memoize(
    function(namespace: Namespace) {
      return new Serializer(namespace)
    }
)

function serialize(entity: Record, namespace: Namespace) {
    //  remove the type
    let values = Object.assign({}, entity) as any
    //  remove the key
    delete values.key
    return getSerializer(namespace).stringify(values)
}

function deserialize(key: ModelKey, serialized: string, namespace: Namespace) {
    let values = getSerializer(namespace).parse(serialized) as Record
    //  restore the key
    values.key = key
    //  restore the type
    return new key.type!(values as any)
}

export function toDocumentValues(entity: Record, namespace: Namespace) {
    return { [serializedProperty]: serialize(entity, namespace), ...getIndexedValues(entity) }
}

function getKey(namespace: Namespace, doc: Snapshot) {
    return Key.parse(namespace, doc.ref.path) as ModelKey
}

export function toEntity<T extends Record>(namespace: Namespace, doc: Snapshot, key: ModelKey = getKey(namespace, doc)): T | null {
    if (!doc.exists) {
        return null
    }
    let data = doc.data()!
    return deserialize(key, data[serializedProperty], namespace)
}

export function toGoogleQuery(db: firebase.firestore.Firestore, key: Key) {
    let { parent, type, query } = key
    let gquery: firebase.firestore.Query = db.collection(key.path)
    if (query) {
        if (query.limit != null) {
            gquery = gquery.limit(query.limit)
        }

        if (query.offset != null) {
            gquery = gquery.startAt(query.offset)
        }

        if (query.sort) {
            for (const sort of query.sort) {
                for (const name in sort) {
                    if (sort.hasOwnProperty(name)) {
                        gquery = gquery.orderBy(name, sort[name] ? "asc" : "desc")
                    }
                }
            }
        }

        if (query.where) {
            const where = query.where
            for (const name in where) {
                const value = where[name]
                if (typeof value === "object") {
                    for (let op in value) {
                        // convert op to google format
                        let googleOp = op === "contains" ? "array-contains" : op as WhereFilterOp
                        gquery = gquery.where(name, googleOp, value[op])
                    }
                } else {
                    gquery = gquery.where(name, "==", where[name])
                }
            }
        }
    }

    return gquery
}

export default class FireStore extends MemoryStore {

    private namespace: Namespace
    private serializer: Serializer
    private db: firebase.firestore.Firestore

    constructor(namespace: Namespace, app: firebase.app.App) {
        super()
        this.namespace = namespace
        this.serializer = new Serializer(namespace)
        this.db = app.firestore()
    }

    ensureWatched(key: Key) {
        if (!super.ensureWatched(key)) {
            return false
        }

        let handleEntities = (entities: Map<Key,Record|null>) => {
            // now... do we store individual query results, or entire result sets?
            // for now let's just store the whole value till we can analyze
            for (let key of entities.keys()) {
                this.watched.add(key.string)
                let entity = entities.get(key)
                super.setValue(key, entity)
            }
            // store the results for the keys query
            if (Key.isSearchKey(key) && key.query != null && key.query.limit != null) {
                let keys: Key[] = []
                for (let entity of entities.values()) {
                    if (entity != null) {
                        keys.push(entity.key)
                    }
                }
                super.setValue(key, keys)
            }
            if (Key.isModelKey(key) && entities.size == 0) {
                super.setValue(key, null)
            }
        }

        console.log("FireStore.ensureWatched: " + key)

        if (Key.isSearchKey(key)) {
            // query set of entities
            let collectionRef = toGoogleQuery(this.db, key)
            collectionRef.onSnapshot(snapshot => {
                let keys: Key[] = []
                // save each doc
                for (let doc of snapshot.docs) {
                    let key = getKey(this.namespace, doc)
                    this.watched.add(key.string)
                    let entity = toEntity(this.namespace, doc, key)
                    super.setValue(key, entity)
                    if (entity != null) {
                        keys.push(key)
                    }
                }
                // save keys as result of query.
                super.setValue(key, keys)
            })
        }
        else {
            let docRef = this.db.doc(key.path)
            docRef.onSnapshot(doc => {
                let key = getKey(this.namespace, doc)
                let entity = toEntity(this.namespace, doc, key)
                super.setValue(key, entity)
            })
        }
        return true
    }

    protected setValue(key: Key, value: Value) {
        let changed = super.setValue(key, value)
        if (changed && Key.isModelKey(key)) {
            //  mark this entity as watched
            this.watched.add(key.toString());
            if (value != null) {
                if (key.type != null && value.constructor !== key.type) {
                    value = new key.type(value as any)
                }
            }

            let docRef = this.db.doc(key.path)
            if (value != null) {
                docRef.set(toDocumentValues(value as Record, this.namespace), { merge: true }).then(() => {
                    console.log(`FireStore.setValue updated`)
                }).catch(e => {
                    console.error(`FireStore.setValue update error:`, e)
                })
            }
            else {
                docRef.delete().then(() => {
                    console.log(`FireStore.setValue deleted`)
                }).catch(e => {
                    console.error(`FireStore.setValue delete error`, e)
                })
            }
        }
        return changed
    }

}
