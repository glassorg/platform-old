import Context from "../../../Context";
import Model from "../../../../data/Model";
import Key, { ModelKey } from "../../../../data/Key";
import { Render } from "../../../Component";
import { Schema } from "../../../../data/schema";
import Stylesheets from "../../Stylesheets";
import ScrollPanel, { ScrollPanelState } from "../ScrollPanel";
import State from "../../../../data/State";
import html from "../..";

Stylesheets.add(s => `
    .DataTable {
        display: flex;
        flex-direction: column;
    }
    .DataTable_Head, .DataTable_Foot {
        flex: 0 0 auto;
    }
    .DataTable_HeadRow, .DataTable_FootRow {
        display: flex;
        flex-direction: row;
        min-height: 30px;
        transition: all 0.5s;
        font-size: 0.8em;
        font-weight: 600;
    }
    .DataTable_HeadRow {
        border-bottom: solid 1px ${s.colors.foreground.weak};
    }
    .DataTable_HeadRow_scrolled {
        box-shadow: 0px 3px 3px 0px ${s.colors.shadow};
    }
    .DataTable_FootRow_scrolled {
        box-shadow: 0px -3px 3px 0px ${s.colors.shadow};
        border-top: solid 1px ${s.colors.foreground.weak};
    }
    .DataTable_Body {
        flex: 1 1 auto;
        overflow: scroll;
    }
    .DataTable_BodyRow {
        display: flex;
        flex-direction: row;
        border-bottom: solid 1px ${s.colors.foreground.weak};
    }
    .DataTable_Row > * {
        display: inline-flex;
        align-items: center;
    }
    @media (pointer: coarse) {
        .DataTable_BodyRow {
            height: 50px;
        }
        .DataTable_Row > * {
            padding-left: 10px;
            padding-right: 10px;
        }
    }
`)

@Model.class()
class DataTableState extends State {

    @Model.property({ type: "boolean", default: false })
    checked!: boolean
}

export type DataColumn<T extends Model = Model> = {
    head: Render<{column: DataColumn, keys: Array<ModelKey<T>> | undefined}> | string
    body: Render<{column: DataColumn, record: T}>
    foot?: Render<{column: DataColumn, keys: Array<ModelKey<T>> | undefined}> | string
    justify?: "left" | "right" | "center"
    width?: number
    minWidth?: number
    maxWidth?: number
    marginLeft?: number
    marginRight?: number
}

function DataTable_BodyRow(c: Context, p: { columns: DataColumn[], key: ModelKey }) {
    let { columns, key } = p
    let record = c.store.get(key)
    c.begin(html.div, { class: "DataTable_BodyRow DataTable_Row" })
        if (record) {
            for (let column of columns) {
                c.render(column.body, { column, record })
            }
        }
    c.end(html.div)
}

function DataTable_HeadFoot(c: Context, p: { bodyId: string, keys: ModelKey[] | undefined, columns: DataColumn[], type: "Head" | "Foot" }) {
    let { bodyId, columns, keys } = p
    let { store, text, end, render } = c
    let scrollState = store.get(Key.create(ScrollPanelState, bodyId))
    let scrolled = (p.type === "Head") ? !scrollState.isScrolledToTop : !scrollState.isScrolledToBottom
    let lowerType = p.type.toLowerCase()
    c.begin(html.div, { class: `DataTable_${p.type}` })
        c.begin(html.div, { class: `DataTable_${p.type}Row DataTable_Row ${scrolled ? `DataTable_${p.type}Row_scrolled` : ``}` })
            for (let column of columns) {
                let headOrFoot = column[lowerType] || ""
                if (typeof headOrFoot === "function") {
                    headOrFoot(c, { column, keys })
                }
                else {
                    c.begin(html.span)
                        c.text(headOrFoot)
                    c.end(html.span)
                }
            }
        c.end(html.div)
    c.end(html.div)
}

function getStyleProperty(column: DataColumn) {
    let buffer: any[] = [
        "margin-left: ", column.marginLeft != null ? column.marginLeft : 6, "px;",
        " margin-right: ", column.marginRight != null ? column.marginRight : 6, "px;"
    ]
    if (column.width) {
        buffer.push(" flex: 0 0 ", column.width, "px;")
    } else {
        buffer.push(" flex: 1 1 100px;")
        if (column.minWidth)
            buffer.push(" min-width:", column.minWidth, "px;")
        if (column.maxWidth)
            buffer.push(" max-width:", column.maxWidth, "px;")
    }
    if (column.justify) {
        buffer.push(" justify-content:", column.justify === "center" ? "center" : column.justify === "left" ? "flex-start" : "flex-end", ";")
    }
    return buffer.join("")
}

function beginCell(c: Context, column: DataColumn) {
    c.begin(html.span)
}
function endCell(c: Context) {
    c.end(html.span)
}

export function createColumn<T extends Model = Model>(schema: Schema & { name }) {
    return {
        head(this: DataColumn, c: Context) {
            c.text(schema.title || schema.name || "?")
        },
        body(this: DataColumn, c: Context, record) {
            let value = record[schema.name]
            let displayValue = value != null ? value.toString() : ""
            c.text(displayValue)
        }
    }
}

export function createColumns<T extends Model = Model>(
    schema: Schema,
    properties?: string[]
) {
    if (properties == null)
        properties = Object.keys(schema.properties || {}).filter(name => schema.properties![name]!.visible !== false)
    return properties.map(name => createColumn<T>(schema.properties![name] as any))
}

function renderColumnStyles(c: Context, p: { id: string, columns: DataColumn[] }) {
    let { id, columns } = p
    for (let i = 0; i < columns.length; i++) {
        let column = columns[i]
        c.begin(html.style)
            let style = getStyleProperty(column)
            c.text(`#${p.id} .DataTable_Row > *:nth-child(${i + 1}) { ${style} }`)
        c.end(html.style)
    }
}

export default function DataTable(c: Context, p: {
    id: string,
    keys: ModelKey[] | undefined,
    columns: DataColumn[],
    class?: string,
    value?: boolean,
    onchange?: (value: boolean) => void
}) {
    let { render, text, end } = c
    let { id, class: className = "", value, keys, columns } = p
    let stateKey = Key.create(DataTableState, id)
    let currentState = c.store.get(stateKey)
    let bodyId = `${id}_Body`
    c.begin(html.div, { class: "DataTable", id })
        renderColumnStyles(c, p)
        render(DataTable_HeadFoot, { bodyId, keys, columns, type: "Head" })
        render(ScrollPanel, {
            id: bodyId,
            class: "DataTable_Body",
            content(c: Context) {
                if (keys) {
                    for (let key of keys) {
                        render(DataTable_BodyRow, { key, columns })
                    }
                }
            }
        })
        render(DataTable_HeadFoot, { bodyId, keys, columns, type: "Foot" })
    c.end(html.div)
}
