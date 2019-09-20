import Context from "../../Context"
import { Schema, InputArguments } from "../../../data/schema"
import { string } from "../../../data/schema"
import * as html from "../"

export type FieldArguments = InputArguments & {
    id: string,
    schema: Schema & { name, title },
    onchange?: (e: Event) => void
    oninput?: (e: Event) => void
}

export default function Field(c: Context, p: FieldArguments) {
    let editor = p.schema.createInput || string.createInput!
    c.begin(html.label)
        c.empty(html.span, p.schema.title)
        c.render(editor, p)
    c.end(html.label)
}
