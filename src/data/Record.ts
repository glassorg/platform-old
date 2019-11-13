import Entity from "./Entity"
import Model from "./Model"
import TimeStamp from "./TimeStamp"

export default abstract class Record extends Entity {

    static additionalProperties = { not: {} }

    @Model.property(TimeStamp)
    created?: TimeStamp

    @Model.property(TimeStamp)
    updated?: TimeStamp

    @Model.property(TimeStamp)
    deleted?: TimeStamp

    static store = "server"

}
