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

export async function put(patches: Batch) {
    let keys = getKeys(Object.keys(patches))
    for (let key of keys) {
        if (!Key.isModelKey(key)) {
            throw new Error(`Invalid model key: ${key}`)
        }
    }
    let response: Batch = {}
    let newEntities: Entity[] = []
    let entities = await database.all(keys)
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i]
        let patch = patches[key.toString()]
        let entity = entities[i][0]
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
        newEntities.push(entity)
        response[key.toString()] = patch == null ? null : entity
    }
    database.put(newEntities)
    return response
}

export async function get(keyStrings: string[]): Promise<Entity[][]> {
    const keys = getKeys(keyStrings)
    return await database.all(keys)
}