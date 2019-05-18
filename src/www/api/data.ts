import { Request, Response } from "express";
import * as webServer from "../../server/webServer";
import Firestore from "../../server/gcloud/Firestore";
import Key from "../../data/Key";
import Entity from "../../data/Entity";
import Patch from "../../data/Patch";
import Model from "../../data/Model";
import clonePatch from "../../utility/clonePatch";

const database = new Firestore({ namespace: webServer.instance.namespace })

function getKeys(keyStrings: string[]) {
    return keyStrings.map(k => Key.parse(database.namespace, k))
}

type Batch = { [key: string]: Patch<Entity> }

//  create: entities, each is assigned a new key?
export async function create(batch: Batch) {
    throw new Error("not implemented")
}
export async function set(batch: Batch) {
    await put(batch, false)
    // set does not return full data, just confirmation count
    return Object.keys(batch).length
}
export async function patch(batch: Batch) {
    return await put(batch, true)
}

async function put(batch: Batch, patch: boolean) {
        let keys = getKeys(Object.keys(batch))
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

export async function get(keyStrings: string[]): Promise<Entity[][]> {
    const keys = getKeys(keyStrings)
    return await database.all(keys)
}