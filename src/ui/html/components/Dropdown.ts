import Context from "../../Context";
import { InputState } from "./Input";
import Key from "../../../data/Key";
import FocusState from "../../../model/FocusState";
import * as html from "../";

export default function Dropdown(c: Context, p: {
    id: string,
    class?: string,
    value?: string,
    options?: object | any[],
    onchange?: (value: string) => void
}) {
    let { id, class: className = "", value, options, onchange } = p
    if (!id)
        throw new Error("id is required")
    if (!options)
        throw new Error("options is required")
    let key = Key.create(InputState, id)
    let inputState = c.store.peek(key)
    let focusState = c.store.peek(FocusState.key)
    if (value == null)
        value = inputState.value

    c.begin(html.select, {
        id,
        className,
        autofocus: focusState.id === id,
        onchange(this: HTMLSelectElement, e) {
            c.store.patch(key, { value: this.value })
            if (onchange)
                onchange.call(this, e)
        },
        onfocus(e) {
            c.store.patch(FocusState.key, { id })
        }
    })
    for (let optionId in options) {
        let optionText = String(options[optionId])
        c.empty(html.option, { value: optionId, selected: value === optionId }, optionText)
    }
    c.end(html.select)
}