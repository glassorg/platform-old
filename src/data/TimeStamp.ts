import Model from "./Model"
import * as schema from "./schema"
import { string } from "./schema"

@Model.class()
export default class TimeStamp extends Model {

    @Model.property({ type: "string", maxLength: 100, index: true })
    by!: string

    @Model.property(schema.datetime, { index: true })
    time!: string

}
