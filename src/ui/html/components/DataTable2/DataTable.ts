// import Context from "../../../Context";
// import Column from "./Column";
// import Row from "./Row";
// import { Render } from "../../../Component";
// import HtmlContext from "../../HtmlContext";
// import Style from "./Style";
// import ScrollPanel from "../ScrollPanel";
// import Stylesheets from "../../Stylesheets";

// Stylesheets.add(t => `
// .DataTable {
//     display: flex;
//     flex-direction: column;
// }
// `)

// export default function DataTable<T>(
//     c: Context,
//     args: {
//         id: string
//         columns: Column[]
//         content: Render<void>
//         style?: string
//         class?: string
//     }
// ) {
//     const { id, class: _class, columns, content, ...other } = args
//     const { div, span, end, text, render } = HtmlContext(c)
//     div({ id, class: `DataTable ${_class || ""}`, ...other })
//         render(Style, { id, columns })
//         render(Row as any, { columns, property: "head" }) // don't know why any is needed.
//         render(ScrollPanel, { id, content })
//     end()
// }
