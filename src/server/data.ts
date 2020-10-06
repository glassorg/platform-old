import { Request, Response, response } from "express"
import * as webServer from "./webServer"
import Firestore from "./gcloud/Firestore"
import Key from "../data/Key"
import Entity from "../data/Entity"
import Patch, { createPatch } from "../data/Patch"
import Model from "../data/Model"
import clonePatch from "../utility/clonePatch"
import Serializer from "../data/Serializer"

//  THIS WAS MOVED FROM THE OLD www/api WHICH WAS UNSECURE
//  THIS IS IN DIRE NEED OF SOME REFACTORING

export const database = webServer.instance.database

function sendError(error, res, status = 500) {
    console.log(`api/data/query streaming error`, error)
    return res.status(status).send("streaming error")
}

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
        }
        else if (patch != null) {
            // make sure patch is a full instance
            entity = patch instanceof Entity ? patch : new key.type!({ key, ...patch } as any) as Entity
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
    try {
        key = Key.parse(database.namespace, keyString)
    } catch (e) {
        return res.status(400).send(`Invalid Key: ${keyString}`)
    }
    if (!Key.isSearchKey(key)) {
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
            (e) => sendError(e, res)
        )
    } catch (e) {
        sendError(e, res)
    }
}

const dataRegex = /^data:([^;]+);(base64+),(.*)$/i
function addQuery(path: string, req: Request) {
    let index = req.url.indexOf("?")
    return index < 0 ? path : path + decodeURIComponent(req.url.slice(index))
}

export default async function(req: Request, res: Response) {
    let thisPath = "/data/"
    let path = addQuery(req.path.slice(req.path.indexOf(thisPath) + thisPath.length), req)

    console.log("+++++++++++++++++++", { path, namespace: database.namespace })

    let key = Key.parse(database.namespace, path)
    try {
        if (req.method === "GET") {
            let [result]: any = await database.all([key])
            if (Key.isModelKey(key)) {
                result = result[0] ?? null
            }
            // get the sub result if the key specifies a path
            result = key.get(result)
            // IF the result is a data url then we stream it directly as content
            const dataUrl = dataRegex.exec(result)
            if (dataUrl != null) {
                let [,type, encoding, encoded] = dataUrl
                let buffer = new Buffer(encoded, encoding as any)
                res.type(type).send(buffer)
            }
            else {
                res.json(result)
            }
        }
        else if (req.method === "POST" || req.method === "PUT") {
            let value
            if (req.method === "POST") {
                //  json body
                value = new Serializer(database.namespace).parse(JSON.stringify(req.body))
            }
            else {
                //  uploading binary file
                let contentType = req.headers["content-type"]
                let encoding = "base64"
                let encoded = req.body.toString(encoding)
                value = `data:${contentType};${encoding},${encoded}`
            }
            let applyPatch = key.patch(value)
            console.log("applyPatch------", applyPatch)
            // IF the user
            let result = await patch({ [key.toString()]: applyPatch })
            res.json({})
        }
        else {
            sendError(`Method not supported: ${req.method}`, res)
        }
    }
    catch (e) {
        sendError(e, res)
    }
}