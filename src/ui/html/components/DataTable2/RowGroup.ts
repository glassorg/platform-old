import Context from "../../../Context";
import HtmlContext from "../../HtmlContext";
import Column from "./Column";
import Stylesheets from "../../Stylesheets";
import Row from "./Row";
import Icon from "../Icon";
import Model from "../../../../data/Model";
import State from "../../../../data/State";
import { boolean } from "../../../../data/schema";
import Key from "../../../../data/Key";

Stylesheets.add(t => `
    .DataTable_RowGroup {
    }
    .DataTable_RowGroup > *:nth-child(1) {
        font-size: small;
        font-weight: bold;
    }
    .DataTable_RowGroup_ToggleCell {
        display: flex;
        flex-direction: row;
        cursor: pointer;
        user-select: none;
    }
    .DataTable_RowGroup_ToggleCell > *:nth-child(1) {
        flex: 0 0 auto;
    }
    .DataTable_RowGroup_ToggleCell > *:nth-child(2) {
        display: flex;
        flex: 1 1 auto;
        justify-content: center;
    }
`)
        // .DataTable_RowGroup > *:nth-child(2) {
        //     transition: transform 500ms linear;
        // }
        // .DataTable_RowGroup_closed > *:nth-child(2) {
        //     transform: scaleY(0);
        // }

@Model.class()
export class RowGroupState extends State {

    @Model.property(boolean, { default: true })
    open!: boolean

}

export default function RowGroup<T = any>(c: Context, args: { id: string, columns: Column<T>[], data?: T, content: (c: Context) => void }) {
    const { id, columns, content, data } = args
    const { div, end, text, render } = HtmlContext(c)
    const key = Key.create(RowGroupState, id)
    const state = c.store.get(key)
    div({ class: "DataTable_RowGroup" })
        div({ class: "DataTable_Row" })
            for (let i = 0; i < columns.length; i++) {
                let column = columns[i]
                if (i === 0) {
                    div({
                        class: "DataTable_RowGroup_ToggleCell",
                        onclick(e: MouseEvent) {
                            c.store.patch(key, { open: !state.open })
                            e.preventDefault()
                        }
                    })
                        render(Icon, { src: state.open ? "baseline-remove" : "baseline-add" })
                        div()
                            render(column.body, data)
                        end()
                    end()
                } else {
                    render(column.body, data)
                }
            }
        end()
        if (state.open) {
            render(content)
        }            
    end()
}