import Context from "../../../Context";
import HtmlContext from "../../HtmlContext";
import Column from "./Column";
import Stylesheets from "../../Stylesheets";

Stylesheets.add(t => `
    .DataTable_Row {
        display: flex;
        flex: 0 0 auto;
        border-bottom: solid 1px ${t.colors.foreground.weak};
    }
    .DataTable_Row > * {
        display: flex;
        align-items: center;
        padding: 4px 8px;
        border-right: solid 1px ${t.colors.foreground.weak};
        overflow: hidden;
    }
`)

export default function Row<T = any>(c: Context, args: { columns: Column<T>[], data?: T, property?: string }) {
    const { columns, data, property = "body" } = args
    const { div, end, text, render } = HtmlContext(c)
    div({ class: "DataTable_Row" })
        for (let column of columns) {
            render(column[property], data)
        }
    end()
}