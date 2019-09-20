import * as schema from "../data/schema"
import Key from "../data/Key"
import Store from "../data/Store"
import Model, { ModelClass } from "../data/Model"
import { memoize } from "../utility/common"
import User from "./User"

const sessionKey = Key.create<string>({ name: "AccessToken_session", store: "session", type: "string" }, "singleton")
const localKey = Key.create<string>({ name: "AccessToken_local", store: "local", type: "string" }, "singleton")

const tokenToIdentity = memoize((token: string) => {
    const [header, message, signature] = token.split(".")
    return new Identity(JSON.parse(atob(message)), { token })
})

/**
 * This model represents the parsed body of our access tokens.
 * Use the static get/set functions to store or retrieve.
 */
@Model.class()
export default class Identity extends Model {

    @Model.property(schema.number)
    exp!: number

    @Model.property(schema.datetime)
    issued!: number

    @Model.property(schema.name)
    name!: string

    @Model.property(schema.email)
    email!: string

    @Model.property(schema.string)
    token!: string

    getUserKey(userClass: ModelClass<User> = User) {
        return Key.create(userClass, this.email)
    }

    get initials() {
        return this.name.split(" ").map(name => name[0]).join("").toUpperCase()
    }

    static get(): Identity | null {
        const sessionToken = Store.default.get(sessionKey)
        const localToken = Store.default.get(localKey)
        const token = sessionToken || localToken
        return token != null ? tokenToIdentity(token) : null
    }
    static set(token: string | null, remember: boolean = false) {
        Store.default.patch(sessionKey, remember ? token : null)
        Store.default.patch(localKey, remember ? null : token)
    }
    static revoke() {
        Identity.set(null)
    }

}
