import Context from "../../Context";
import html from "..";
import Key, { ModelKey } from "../../../data/Key";
import State from "../../../data/State";
import { key, string, number, Schema, getSubSchema, InputArguments } from "../../../data/schema";
import Store from "../../../data/Store";
import Stylesheets from "../Stylesheets";
import { FieldArguments } from "./Field";
import { isAncestorOrSelf } from "../functions";
import Rectangle from "../../math/Rectangle";

@State.class()
class EditPopupState extends State {

    @State.property(number, { default: 0 })
    top!: number

    @State.property(number, { default: 0 })
    left!: number

    @State.property(number, { default: 0 })
    minWidth!: number

    @State.property(number, { default: 0 })
    minHeight!: number

    @State.property(key)
    key?: Key

    @State.property(string)
    property?: string

    @State.property({})
    schema?: Schema

    static store = "memory"
    static key = Key.create(EditPopupState)
}

document.body.getBoundingClientRect()

export function beginEdit(args: { key: Key, property: string, schema?: Schema, position?: Rectangle, event? }) {
    let { key, property, position, event, schema } = args
    let boundingRect = event ? event.target.getBoundingClientRect() : { top: 0, left: 0, width: 200, height: 50 }
    let left = position ? position.y : boundingRect.left
    let top = position ? position.x : boundingRect.top
    let minWidth = boundingRect.width
    let minHeight = boundingRect.height
    if (schema == null) {
        schema = getSubSchema(key.type!, property)
        if (schema == null) {
            throw new Error(`Cannot edit ${key.type!.name}: ${property}, schema not found`)
        }
    }
    Store.default.patch(EditPopupState.key, { key, property, schema, top, left, minWidth, minHeight })
}

export function endEdit() {
    Store.default.patch(EditPopupState.key, { key: null, property: null, schema: null })
}

Stylesheets.add(s => `
    .EditPopup {
        position: absolute;
        transition:
            position 0ms;
    }
`)

export default function EditPopup(c: Context) {
    const state = c.store.get(EditPopupState.key)
    let popup = c.begin(html.div, {
        class: "EditPopup card z2",
        style: `
            visibility: ${state.key ? "visible" : "hidden"};
            left: ${state.left}px;
            top: ${state.top}px;
            min-width: ${state.minWidth}px;
            min-height: ${state.minHeight}px;
        `
    })
        if (state.key) {
            let schema = state.schema
            if (schema) {
                if (schema.createInput && state.property) {
                    let record = c.store.get(state.key)
                    let value = record != null ? record[state.property] : undefined
                    let input = schema.createInput(c, {
                        id: "EditPopup_input",
                        schema: schema as any,
                        focus: true,
                        select: true,
                        value,
                        onconfirm(e) {
                            let value = this.value
                            if (state.key && state.property) {
                                c.store.patch(state.key as ModelKey, { [state.property]: value })
                            }
                            endEdit()
                        },
                        oncancel(e) {
                            endEdit()
                        }
                    })
                }
            }
        }
    c.end(html.div)

    if (state.key) {
        function bodyMouseDownListener(e) {
            if (!isAncestorOrSelf(e.target, popup)) {
                endEdit()
            }
        }
        document.body.addEventListener("mousedown", bodyMouseDownListener)
        return () => {
            document.body.removeEventListener("mousedown", bodyMouseDownListener)
        }
    }
}
