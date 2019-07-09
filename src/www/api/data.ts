import { Request, Response, response } from "express";
import * as webServer from "../../server/webServer";
import Firestore from "../../server/gcloud/Firestore";
import Key from "../../data/Key";
import Entity from "../../data/Entity";
import Patch from "../../data/Patch";
import Model from "../../data/Model";
import clonePatch from "../../utility/clonePatch";

const database = webServer.instance.database

function getKeys(keyStrings: Array<string|string[]>) {
    return keyStrings.map(k => {
        return Array.isArray(k) ? getKeys(k) : Key.parse(database.namespace, k)
    })
}

type Batch = { [key: string]: Patch<Entity> }

//  create: entities, each is assigned a new key?
export async function create(batch: Batch) {
    throw new Error("not implemented")
}
export async function set(batch: Batch) {
    return await put(batch, false)
}
export async function patch(batch: Batch) {
    return await put(batch, true)
}

const batchLimit = 500
function splitBatchToSmallBatchesUnderLimit(batch: Batch) {
    let currentBatchSize = 0
    let batches: Batch[] = [{}]
    for (let key in batch) {
        if (currentBatchSize === batchLimit) {
            batches.push({})
            currentBatchSize = 0
        }
        batches[batches.length - 1][key] = batch[key]
        currentBatchSize++
    }
    return batches
}

async function put(batch: Batch, patch: boolean) {
    let batches = splitBatchToSmallBatchesUnderLimit(batch)
    let results = await Promise.all(batches.map(b => putLimited(b, patch)))
    let mergedResult = Object.assign({}, ...results)
    return mergedResult
}

async function putLimited(batch: Batch, patch: boolean) {
    let keys = getKeys(Object.keys(batch))
    if (keys.length > batchLimit) {
        throw new Error(`Batch exceeded ${batchLimit} row limit: ${keys.length}`)
    }
    for (let key of keys) {
        if (!Key.isModelKey(key)) {
            throw new Error(`Invalid model key: ${key}`)
        }
    }
    let response: Batch = {}
    let newEntities: Entity[] = []
    let entities = patch ? await database.all(keys) : null
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i]
        let patch = batch[key.toString()]
        let entity = entities != null ? entities[i][0] : null
        if (entity != null) {
            // no deletion yet.
            if (patch == null) {
                throw new Error("No deletion yet")
            }
            entity = clonePatch(entity, patch)
        } else if (patch != null) {
            // make sure patch is a full instance
            entity = patch instanceof Entity ? patch : new key.type!(patch as any) as Entity
        }
        newEntities.push(entity!)
        response[key.toString()] = patch == null ? null : entity
    }
    await database.put(newEntities)
    return response
}

export async function get(keyStrings: Array<string|string[]>): Promise<Entity[][]> {
    const keys = getKeys(keyStrings)
    return await database.all(keys)
}

export function query(req: Request, res: Response & { flush }) {
    let keyString = req.body
    let key: Key
    let sendError = (error) => {
        console.log(`api/data/query streaming error`, error)
        return res.status(500).send("streaming error")
    }
    try {
        key = Key.parse(database.namespace, keyString)
    } catch (e) {
        return res.status(400).send(`Invalid Key: ${keyString}`)
    }
    if (!Key.isQueryKey(key)) {
        return res.status(400).send(`Not a query key: ${key}`)
    }
    res.type("text/plain")
    try {
        database.raw(
            key,
            (row) => {
                if (row != null) {
                    res.write(row)
                    res.write("\n")
                } else {
                    res.end()
                }
            },
            sendError
        )
    } catch (e) {
        sendError(e)
    }
}
