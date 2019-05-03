import Context from "../../Context";
import Model from "../../../data/Model";
import Key from "../../../data/Key";
import FocusState from "../../../model/FocusState";
import State from "../../../data/State";
import * as html from "../";

@Model.class()
class CheckboxState extends State {

    @Model.property({ type: "boolean", default: false })
    checked!: boolean

}

export default function Checkbox(c: Context, p: {
    id: string,
    class?: string,
    value?: boolean,
    onchange?: (e: Event) => void
}) {
    let { id, class: className = "", value, onchange } = p
    let key = Key.create(CheckboxState, id)
    c.empty(html.input, {
        id,
        class: `Checkbox ${className}`,
        type: "checkbox",
        checked: value != null ? value : c.store.get(key).checked,
        autofocus: c.store.peek(FocusState.key).id === id,
        onchange(this: HTMLInputElement, e: Event) {
            if (onchange) {
                onchange.call(this, e)
            }
            c.store.patch(key, { checked: this.checked })
        },
        onfocus(this: HTMLInputElement, e: Event) {
            c.store.patch(FocusState.key, { id })
        }
    })
}
