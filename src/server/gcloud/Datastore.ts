import GoogleDatastore from "@google-cloud/datastore";
import Key, { QueryKey, ModelKey} from "../../data/Key";
import IDatabase from "./IDatabase";
import { DatastoreKey } from "@google-cloud/datastore/entity";
import Entity from "../../data/Entity";
import { Schema } from "../../data/schema";
import * as common from "../../utility/common";
import Namespace from "../../data/Namespace";
import Serializer from "../../data/Serializer";

const { Query, Transaction } = GoogleDatastore

const serializedProperty = "_"
const excludeFromIndexes = [serializedProperty]
type GoogleEntity = { [serializedProperty]: string, [GoogleDatastore.KEY]: DatastoreKey }
type GoogleEntityUpsert = { key: DatastoreKey, data: any, excludeFromIndexes: string[] }

function getIndexedValues(entity: Entity) {
    let properties = (entity.constructor as any).properties as { [name: string]: Schema }
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

function getGooglePath(key: ModelKey, path: string[] = []) {
    if (key.parent) {
        getGooglePath(key.parent, path)
    }
    if (key.type == null || key.id == null || key.query != null) {
        throw new Error("Invalid entity key: " + key)
    }
    path.push(key.type.name)
    path.push(key.id)
    return path
}

function getGoogleKey(gdatastore: GoogleDatastore, key: ModelKey) {
    return gdatastore.key(getGooglePath(key))
}

function getGlassKey(gkey: DatastoreKey, namespace: Namespace) {
    return Key.parse(namespace, ...gkey.path.map(x => String(x))) as ModelKey
}

function getGoogleQuery(gdatastore: GoogleDatastore, key: QueryKey) {
    if (!key.type || !key.type.name) {
        throw new Error("A key must have a schema with a name to create a query.")
    }

    let { parent, type, query } = key

    const gquery = gdatastore.createQuery(type.name)

    if (parent) {
        gquery.hasAncestor(getGoogleKey(gdatastore, parent))
    }

    if (query) {

        if (query.limit != null) {
            gquery.limit(query.limit)
        }

        if (query.offset != null) {
            gquery.offset(query.offset)
        }

        if (query.sort) {
            for (const sort of query.sort) {
                for (const name in sort) {
                    if (sort.hasOwnProperty(name)) {
                        const ascending = sort[name]
                        gquery.order(name, { descending: !ascending })
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
                    gquery.filter(name, op, where[name])
                } else {
                    gquery.filter(name, where[name])
                }
            }
        }
    }

    return gquery
}

export default class Datastore implements IDatabase {

    private gdatastore: GoogleDatastore
    public readonly namespace: Namespace

    constructor(namespace: Namespace) {
        this.gdatastore = new GoogleDatastore()
        this.namespace = namespace
    }

    getGoogleEntity(gdatastore: GoogleDatastore, entity: Entity, key = entity.key): GoogleEntityUpsert {
        let data = getIndexedValues(entity)
        data[serializedProperty] = serialize(entity, this.namespace)
        return { key: getGoogleKey(gdatastore, key), data, excludeFromIndexes }
    }

    getGlassEntity(gentity: GoogleEntity) {
        let gkey = gentity[GoogleDatastore.KEY]
        let key = getGlassKey(gkey, this.namespace)
        return deserialize(key, gentity[serializedProperty], this.namespace)
    }

    //  retrieve
    get<T = Entity>(keys: Key[]): Promise<T[][]> {
        const getGlassEntities = (values: object[]) => {
            return values.filter((value) => value !== undefined)
            .map((value) => this.getGlassEntity(value as GoogleEntity))
        }
        return <any>Promise.all(
            keys.map(
                (key) => {
                    if (Key.isModelKey(key)) {
                        let gkey = getGoogleKey(this.gdatastore, key)
                        return this.gdatastore.get(gkey).then(getGlassEntities as any) as Promise<Entity[]>
                    } else {
                        let gquery = getGoogleQuery(this.gdatastore, key as QueryKey)
                        return this.gdatastore.runQuery(gquery).then(
                            results => {
                                let entities = getGlassEntities(results[0])
                                return entities
                            }
                            // getGlassEntities as any
                        ) as any as Promise<Entity[]>
                    }
                }
            )
        )
    }

    //  create, update, delete
    async put(entities: Entity[]) {
        let gentities = entities.map((entity) => this.getGoogleEntity(this.gdatastore, entity))
        let response = await this.gdatastore.upsert(gentities).then(
            () => console.log("ENTITIES WRITTEN: " + JSON.stringify(entities, null, 2))
        )
    }
}
