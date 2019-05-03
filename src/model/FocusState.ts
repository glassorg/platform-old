import Model from "../data/Model"
import Key from "../data/Key"
import State from "../data/State"

@Model.class()
export default class FocusState extends State {

    @Model.property({ type: "string", default: "" })
    id!: string

    @Model.property({ type: "integer", default: 0 })
    start!: number

    @Model.property({ type: "integer", default: 0 })
    end!: number

    @Model.property({ enum: ["forward", "backward", "none"], default: "none" })
    direction!: "forward" | "backward" | "none"

    static key = Key.create(FocusState, "0")

}
