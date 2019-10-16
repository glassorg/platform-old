import Context from "../../Context"
import * as html from "../"

export default function Icon(c: Context, p: { src: string } & { [key: string]: any}) {
    let { src, class: cls = "", ...rest } = p
    // icons/material/baseline-remove-24px.svg
    if (src.indexOf("/") < 0) {
        src = "/icons/material/" + src
    }
    if (src.indexOf(".") < 0) {
        src = src + "-24px.svg"
    }
    c.empty(html.img, { class: "Icon " + cls, width: 20, height: 20, src, ...rest })
}