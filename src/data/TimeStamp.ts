import Model from "./Model"
import * as schema from "./schema"

@Model.class()
export default class TimeStamp extends Model {

    @Model.property(schema.email, { index: true })
    by!: string

    @Model.property(schema.datetime, { index: true })
    date!: string

}
