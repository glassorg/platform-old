// import Model from "../../../../data/Model";
// import { Render } from "../../../Component";
// import Context from "../../../Context";
// import html from "../../";
// import { getValue } from "../../../../data/schema";

// type ColumnProperties<T> = {
//     [P in keyof Column<T>]?: Column<T>[P]
// }

// function getStyleProperty(column: Column) {
//     let buffer: any[] = [
//         "padding-left: ", column.paddingLeft != null ? column.paddingLeft : 6, "px;",
//         " padding-right: ", column.paddingRight != null ? column.paddingRight : 6, "px;"
//     ]
//     let width = column.width || 100
//     let basis = column.flex || 0
//     buffer.push(" flex: ", basis, " ", basis, " ", width || 100, "px;")
//     if (column.minWidth)
//         buffer.push(" min-width:", column.minWidth, "px;")
//     if (column.maxWidth)
//         buffer.push(" max-width:", column.maxWidth, "px;")
//     if (column.justify) {
//         buffer.push(" justify-content:", column.justify === "center" ? "center" : column.justify === "left" ? "flex-start" : "flex-end", ";")
//     }
//     if (column.style) {
//         buffer.push(column.style)
//     }
//     return buffer.join("")
// }

// export default class Column<T = any> {
//     name!: string
//     title?: string
//     justify?: "left" | "right" | "center"
//     flex?: number
//     width?: number
//     minWidth?: number
//     maxWidth?: number
//     paddingLeft?: number
//     paddingRight?: number
//     style: string
//     head: Render<void> = (c: Context) => {
//         c.begin(html.span)
//             c.text(this.title || this.name)
//         c.end(html.span)
//     }
//     body: Render<T> = (c: Context, data: T) => {
//         c.begin(html.span)
//             c.text(getValue(data, this.name))
//         c.end(html.span)
//     }

//     constructor(properties: ColumnProperties<T> & { name }) {
//         for (let name in properties) {
//             this[name] = properties[name]
//         }
//         this.style = getStyleProperty(this)
//         this.head = this.head.bind(this)
//         this.body = this.body.bind(this)
//         Object.freeze(this)
//     }

// }
