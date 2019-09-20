import Context from "../../Context"
import { div, span } from ".."
import "./Fab.css"

export default Context.component(function TabControl(c: Context, p: {
    content: string | (() => void),
    class?: string,
    style?: string,
    onclick?: (e: MouseEvent) => void,
}) {
    div({ ...p, class: `Fab ${p.class || ""}`})
})
