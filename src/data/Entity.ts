import Model, { ModelClass } from "./Model"
import { ModelKey } from "./Key"
import * as schema from "./schema"
import TimeStamp from "./TimeStamp"
import { getPath } from "../utility/common"
import Patch, { createPatch } from "./Patch"
import Store from "./Store"

export default abstract class Entity extends Model {
    
    @Model.property(schema.key, {
        required: true,
        validate(this: Entity, value) {
            if (value.type !== this.constructor)
                return `key is of wrong type: ${value.schema.name}, expected: ${this.constructor.name}`
        },
        id: "."
    })
    key!: ModelKey

    @Model.property(TimeStamp, { id: "," })
    created?: TimeStamp

    @Model.property(TimeStamp, { id: ":" })
    updated?: TimeStamp

    @Model.property(TimeStamp, { id: "" })
    deleted?: TimeStamp

    //  function for patching a descendant object
    patch<This, Descendant>(this: This, value: Patch<Descendant>, descendant: Descendant)
    //  function for patching this entity
    patch<This>(this: This, value: Patch<This>)
    patch(value, descendant = this) {
        let path = getPath(this, descendant)
        if (path == null) {
            throw new Error("descendant not contained within this entity")
        }
        let patch = createPatch(path, value)
        Store.default.patch(this.key, patch)
    }

    static store = "server"

}
