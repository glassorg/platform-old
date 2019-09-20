import * as schema from "../data/schema"
import Entity from "../data/Entity"
import Key from "../data/Key"

@Entity.class()
export default class User extends Entity {

    @Entity.property(schema.name, { title: "Name", minLength: 1, maxLength: 100, required: true })
    name!: string

    @Entity.property(schema.email, { title: "Email", required: true})
    get email() { return this.key.id }

    @Entity.property(schema.phone, { title: "Mobile", required: true })
    mobile!: string

    @Entity.property(schema.string, { maxLength: 500 })
    passwordHash!: string

}

const sessionKey = Key.create({ name: "User.sessionKey", store: "session", type: "string" }, "singleton")
const localKey = Key.create({ name: "User.localKey", store: "local", type: "string" }, "singleton")

