import Context from "../../Context";
import "./Checkbox.css";
import { span } from "../";

export default Context.component(function Checkbox(c: Context, p: {
    value: boolean,
    onclick(e: Event): void
}) {
    const { value, onclick  } = p
    span({
        class: value ? "Checkbox Checkbox_checked" : "Checkbox",
        onclick
    })
})
