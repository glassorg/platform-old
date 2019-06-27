const { Datastore: GDatastore } = require("@google-cloud/datastore");
import { DatastoreKey as GKey } from "@google-cloud/datastore/entity";
import Key, { QueryKey, ModelKey} from "../../data/Key";
import Database from "../Database";
import Entity from "../../data/Entity";
import { Schema } from "../../data/schema";
import * as common from "../../utility/common";
import Namespace from "../../data/Namespace";
import Serializer, { typeKey } from "../../data/Serializer";
import * as compression from "../compression";
import { entity } from "@google-cloud/datastore/build/src/entity";
import Model from "../../data/Model";

const serializedProperty = "_"
const excludeFromIndexes = [serializedProperty]
type GoogleEntity = { [serializedProperty]: string }
type GoogleEntityUpsert = { key, data: any, excludeFromIndexes: string[] }

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
    return getSerializer(namespace).stringify(entity)
    let values = JSON.parse(getSerializer(namespace).stringify(entity))
    delete values[typeKey]
    delete values[Entity.properties.key!.id!.valueOf()]
    return JSON.stringify(values)
}

function deserialize(key: ModelKey, serialized: string, namespace: Namespace) {
    // {
    //     let json = JSON.parse(serialized)
    //     // return json
    //     json[typeKey] = key.type!.name
    //     json.key = key
    //     serialized = JSON.stringify(json)
    // }
    //  TODO: Make our Serializer.deserialize function way faster.
    // let entity = Object.assign(Object.create(key.type!.prototype), JSON.parse(serialized))
    // entity.key = key
    // return entity
    let result = getSerializer(namespace).parse(serialized) as Entity
    return result
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

function getGoogleKey(gdatastore, key: ModelKey) {
    return gdatastore.key(getGooglePath(key))
}

function getGlassKey(gkey, namespace: Namespace) {
    return Key.parse(namespace, ...gkey.path.map(x => String(x))) as ModelKey
}

function getGoogleQuery(gdatastore, key: QueryKey) {
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
                    gquery.filter(name, op, where[name] as any)
                } else {
                    gquery.filter(name, where[name] as any)
                }
            }
        }
    }

    return gquery
}

//  for some reason entities queried in batch from datastore
//  don't seem to be sorted by the requested key order
//  so we will re-sort them here.
function sortEntities(gentities: any[], gkeys: GKey[]): GoogleEntity[] {
    let keyToIndex: { [key: string]: number } = {}
    for (let i = 0; i < gkeys.length; i++) {
        keyToIndex[gkeys[i].path as any] = i
    }
    let sorted: any[] = new Array(gentities.length)
    for (let gentity of gentities) {
        let index = keyToIndex[gentity[GDatastore.KEY].path]
        if (index == null) {
            throw new Error("index not found for key")
        }
        sorted[index] = gentity
    }
    return sorted
}

export default class Datastore extends Database {

    public gdatastore
    public readonly maxLimit = 10000

    constructor(properties: { namespace: Namespace, projectId?: string }) {
        super(properties.namespace)
        this.gdatastore = new GDatastore({ projectId: properties.projectId })
    }

    getGoogleEntity(gdatastore, entity: Entity, key = entity.key): GoogleEntityUpsert {
        let data = getIndexedValues(entity)
        data[serializedProperty] = compression.deflate.compress(serialize(entity, this.namespace))
        return { key: getGoogleKey(gdatastore, key), data, excludeFromIndexes }
    }

    getGlassKey(gentity) {
        let gkey = gentity[GDatastore.KEY]
        return getGlassKey(gkey, this.namespace)
    }
    decompressEntity(gentity) {
        if (gentity == null) {
            return null
        }
        let gkey = gentity[GDatastore.KEY]
        let compressedData = gentity[serializedProperty]
        let decompressed = compression.deflate.decompress(compressedData)
        return decompressed
    }
    deserializeEntity(key, decompressed) {
        return deserialize(key, decompressed, this.namespace)
    }

    getGlassEntity(gentity: GoogleEntity | null, force = false) {
        // return gentity
        if (gentity == null) {
            return null
        }
        let gkey = gentity[GDatastore.KEY]
        let key = getGlassKey(gkey, this.namespace)
        // let compressedSize = gentity[serializedProperty].length
        let compressedData = gentity[serializedProperty]
        // handle legacy decompression for now
        let decompressor = typeof compressedData === "string" ? compression.deflate : compression.jsonCompression
        let decompressed = decompressor.decompress(compressedData)
        // let decompressedSize = JSON.stringify(decompressed).length
        // let ratio = Math.round(compressedSize / decompressedSize * 100)
        // console.log(ratio + "% " + (decompressedSize / 10 ** 6) + " -> " + (compressedSize / 10 ** 6))
        return deserialize(key, decompressed, this.namespace)
    }

    async get<T extends Entity>(keys: ModelKey<T>[]): Promise<Array<T | null>> {
        let gkeys = keys.map(key => getGoogleKey(this.gdatastore, key))
        let [gentities] = await this.gdatastore.get(gkeys) as GoogleEntity[][]
        gentities = sortEntities(gentities, gkeys)
        return gentities.map(gentity => this.getGlassEntity(gentity)) as any
    }

    async query<T extends Entity>(key: QueryKey<T>): Promise<T[]> {
        let gquery = getGoogleQuery(this.gdatastore, key as QueryKey)
        return new Promise((resolve, reject) => {
            let entities: T[] = []
            this.gdatastore.runQueryStream(gquery)
                .on('error', (e) => {
                    console.log("Datastore.query#runQueryStream Error: ", e)
                    reject(e)
                })
                .on('data', (gentity) => {
                    // entities.push(entities.length as any)
                    let entity = this.getGlassEntity(gentity)
                    if (entity) {
                        entities.push(entity as T)
                    }
                })
                // .on('info', (info) => {})
                .on('end', () => {
                    resolve(entities)
                })
        })
    }

    //  create, update, delete
    async put(entities: Entity | Entity[]) {
        if (!Array.isArray(entities)) {
            entities = [entities]
        }
        if (!Model.ValidateAndFreezeOnConstruction) {
            for (let entity of entities) {
                entity.validate()
            }
        }
        let gentities = entities.map((entity) => this.getGoogleEntity(this.gdatastore, entity))
        let response = await this.gdatastore.upsert(gentities).then(
            () => {
                console.log(`Entities written: ${gentities.length}`)
                // console.log("ENTITIES WRITTEN: " + JSON.stringify(entities, null, 2))
            }
        )
    }
}