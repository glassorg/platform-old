import * as schema from "../data/schema"
import Entity from "../data/Entity"
import Key from "../data/Key"

@Entity.class()
export default class User extends Entity {

    @Entity.property({ type: "string" })
    id!: string

    @Entity.property({ type: "string" })
    name!: string

    @Entity.property(schema.email)
    email!: string

    @Entity.property({ type: "boolean" })
    emailVerified!: boolean

    @Entity.property({ type: "string" })
    photoUrl!: string

    // @Entity.property(schema.name, { title: "Name", minLength: 1, maxLength: 100, required: true })
    // name!: string

    // @Entity.property(schema.email, { title: "Email", required: true})
    // get email() { return this.key.id }

    // @Entity.property(schema.phone, { title: "Mobile", required: true })
    // mobile!: string

    // @Entity.property(schema.string, { maxLength: 500 })
    // passwordHash!: string

    static store = "memory"
    static readonly key = Key.create(User, "current")

}

// const sessionKey = Key.create({ name: "User.sessionKey", store: "session", type: "string" }, "singleton")
// const localKey = Key.create({ name: "User.localKey", store: "local", type: "string" }, "singleton")

