import Model, { ModelClass } from "./Model"
import { ModelKey } from "./Key"
import * as schema from "./schema"
import TimeStamp from "./TimeStamp"
import { getPath } from "../utility/common"
import Patch, { createPatch } from "./Patch"
import Store from "./Store"

@Model.class()
export default class Entity extends Model {

    static additionalProperties = {}

    @Model.property(schema.key, {
        required: true,
        validate(this: Entity, value) {
            if (value.type !== this.constructor)
                return `key is of wrong type: ${value.schema.name}, expected: ${this.constructor.name}`
        },
        id: "."
    })
    key!: ModelKey

    //  creates this Entity by patching it into the default store
    create(store: Store = Store.default): this {
        store.patch(this.key, this)
        return this
    }

    //  function for patching a descendant object
    patch<This, Descendant>(this: This, value: Patch<Descendant>, descendant: Descendant): this
    //  function for patching this entity
    patch<This>(this: This, value: Patch<This>): this
    patch(value, descendant = this): this {
        let store = Store.default
        let path = getPath(this, descendant)
        if (path == null) {
            throw new Error("descendant not contained within this entity")
        }
        let patch = createPatch(path, value)
        store.patch(this.key, patch)
        return store.get(this.key)
    }

}
