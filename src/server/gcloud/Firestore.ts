import Record from "../../data/Record"
import Key, { ModelKey, SearchKey } from "../../data/Key"
import Database, { ErrorCallback, RowCallback } from "../Database"
import Namespace from "../../data/Namespace"
import * as common from "../../utility/common"
import {Firestore as GoogleFirestore, Query as GoogleQuery, DocumentReference, DocumentSnapshot} from "@google-cloud/firestore"
import { Schema } from "../../data/schema"
import Serializer from "../../data/Serializer"
import getPackageJson, { getProjectId } from "../getPackageJson"
import { toDocumentValues, toEntity } from "../../data/stores/FireStore"

export function toGoogleQuery(db: GoogleFirestore, key: Key) {
    let { parent, type, query } = key
    let gquery: GoogleQuery = db.collection(key.path)
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

export default class Firestore extends Database {

    private gfirestore: GoogleFirestore
    public readonly projectId?: string = getProjectId()
    public readonly hardDelete: boolean = true

    constructor(properties: { namespace: Namespace } & { [P in keyof Firestore]?: Firestore[P] }) {
        super(properties.namespace)
        Object.assign(this, properties)
        // let packageJson = getPackageJson()
        this.gfirestore = new GoogleFirestore({ projectId: this.projectId })
    }

    raw(key: SearchKey, callback: RowCallback, error?: ErrorCallback) {
        throw new Error("not implemented")
    }

    async get<T extends Record = Record>(keys: ModelKey<T>[]): Promise<Array<T | null>> {
        let refs = keys.map(key => this.gfirestore.doc(key.path))
        let docs = await this.gfirestore.getAll(...refs)
        let entities = docs.map(doc => toEntity<T>(this.namespace, doc as any))
        return entities
    }

    query<T extends Record>(key: SearchKey<T>): Promise<T[]> {
        let gquery = toGoogleQuery(this.gfirestore, key)
        let error: any = null
        return new Promise((resolve, reject) => {
            let records: T[] = []
            gquery.stream().on('data', (doc) => {
                try {
                    // records.push(toEntity<T>(this.namespace, doc)!)
                    records.push(doc)
                } catch (e) {
                    reject(error = e)
                }
            }).on('end', () => {
                if (error == null) {
                    resolve(records)
                }
            }).on('error', (e) => {
                reject(error = e)
            });
        })
    }

    //  create, update, delete
    async put(entities: Record[]) {
        let batch = this.gfirestore.batch()
        for (let entity of entities) {
            let docRef = this.gfirestore.doc(entity.key.toString())
            if (entity.deleted && this.hardDelete) {
                batch.delete(docRef)
            } else {
                let values = toDocumentValues(entity, this.namespace)
                batch.set(docRef, values)
            }
        }
        await batch.commit()
    }
}
