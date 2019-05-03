
import Model from "../data/Model"
import Key, { ModelKey } from "../data/Key"
import State from "../data/State"

@Model.class()
export default class ThemeSettings extends State {

    @Model.property({
        type: "string",
        enum: ["light", "dark"],
        default: "light"
    })
    name!: string

    toString() {
        return this.name
    }

    static store = "local"
    static key = Key.create(ThemeSettings, "0")

}
