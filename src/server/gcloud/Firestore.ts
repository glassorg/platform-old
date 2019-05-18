import Entity from "../../data/Entity";
import Key, { ModelKey, QueryKey } from "../../data/Key";
import Database from "./Database";
import Namespace from "../../data/Namespace";
import * as common from "../../utility/common";
import {Firestore as GoogleFirestore, Query as GoogleQuery, DocumentReference, DocumentSnapshot} from "@google-cloud/firestore";
import { Schema } from "../../data/schema";
import Serializer from "../../data/Serializer";
import getPackageJson, { getProjectId } from "../getPackageJson";

const serializedProperty = "_"

export function getIndexedValues(entity: Entity) {
    let values: any = {}
    let deleted = entity.deleted != null
    common.traverse(entity, entity.constructor as Schema, (value, schema, ancestors, path) => {
        if (schema.index && (!deleted || path[0] === "deleted")) {
            let name = path.join(".")
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

function serialize(entity: Entity, namespace: Namespace) {
    //  remove the type
    let values = Object.assign({}, entity)
    //  remove the key
    delete values.key
    return getSerializer(namespace).stringify(values)
}

function deserialize(key: ModelKey, serialized: string, namespace: Namespace) {
    let values = getSerializer(namespace).parse(serialized) as Entity
    //  restore the key
    values.key = key
    //  restore the type
    return new key.type!(values as any)
}

function toGoogleQuery(gfirestore: GoogleFirestore, key: Key) {
    let { parent, type, query } = key
    let gquery: GoogleQuery = gfirestore.collection(key.path)
    if (query) {
        if (query.limit != null) {
            gquery = gquery.limit(query.limit)
        }

        if (query.offset != null) {
            gquery = gquery.offset(query.offset)
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
                    const op: any = Object.keys(value || {})[0]
                    gquery = gquery.where(name, op, where[name])
                } else {
                    gquery = gquery.where(name, "==", where[name])
                }
            }
        }
    }

    return gquery
}

function toEntity<T extends Entity>(namespace: Namespace, doc: DocumentSnapshot): T | null {
    if (!doc.exists) {
        return null
    }
    let name = doc.ref.path.split('/')[0]
    let type = namespace[name]
    if (type == null) {
        throw new Error(`Type not found: ${name}`)
    }
    let data = doc.data()!
    let key = Key.parse(namespace, doc.ref.path) as ModelKey
    return new type(deserialize(key, data[serializedProperty], namespace)) as T
}

export default class Firestore implements Database {

    private gfirestore: GoogleFirestore
    public readonly namespace!: Namespace
    public readonly projectId?: string = getProjectId()
    public readonly hardDelete: boolean = true

    constructor(properties: { namespace: Namespace } & { [P in keyof Firestore]?: Firestore[P] }) {
        Object.assign(this, properties)
        let packageJson = getPackageJson()
        this.gfirestore = new GoogleFirestore({ projectId: this.projectId })
    }

    async all<T = Entity>(keys: Key[]): Promise<T[][]> {
        return Promise.all(keys.map(key => Key.isModelKey(key) ? this.get(key).then(entity => entity ? [entity] : []) : this.query(key as QueryKey))) as any
    }

    async get<T extends Entity>(key: ModelKey<T>): Promise<T | null> {
        let docRef = this.gfirestore.doc(key.toString())
        let doc = await docRef.get()
        return toEntity<T>(this.namespace, doc) as T | null
    }

    async query<T extends Entity>(key: QueryKey<T>): Promise<T[]> {
        let gquery = toGoogleQuery(this.gfirestore, key)
        let gquerySnapshot = await gquery.get()
        return gquerySnapshot.docs.map(doc => toEntity<T>(this.namespace, doc)!)
    }

    //  create, update, delete
    async put(entities: Entity[]) {
        let batch = this.gfirestore.batch()
        for (let entity of entities) {
            let docRef = this.gfirestore.doc(entity.key.toString())
            if (entity.deleted && this.hardDelete) {
                batch.delete(docRef)
            } else {
                let values = { [serializedProperty]: serialize(entity, this.namespace), ...getIndexedValues(entity) }
                batch.set(docRef, values)
            }
        }
        await batch.commit()
    }
}
