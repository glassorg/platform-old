import Context from "../../Context";
import "./IconButton.css";
import { span } from "../";
import Action from "../../Action";
import Icon from "./Icon";

export default Context.component(function IconButton(c: Context, p: {
    action: Action,
    [props: string]: any,
}) {
    let { action, class: className, ...rest } = p
    span({
        class: `IconButton ${className ?? ''}`,
        content() {
            Icon({
                src: action.icon,
                title: action.name
            })
        },
        ...rest
    })
})
