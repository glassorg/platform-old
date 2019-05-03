
import Model from "../data/Model"
import Key, { ModelKey } from "../data/Key"
import State from "../data/State"

@Model.class()
export default class LocaleSettings extends State {

    @Model.property({
        type: "string",
        default: "en"
    })
    languageCode!: string

    toString() {
        return this.languageCode
    }

    static key = Key.create(LocaleSettings, "0")

}
