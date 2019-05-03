import Context from "../../Context";
import { Render } from "../../Component";
import HtmlContext from "../HtmlContext";
import { endEdit } from "./EditPopup";

export function List<T>(c: Context, args: {
    properties?: object,
    render: Render<T>,
    items: T[]
}) {
    const { div, end, render } = HtmlContext(c)
    div(args.properties)
        for (let item of args.items) {
            render(args.render, item)
        }
    end()
}