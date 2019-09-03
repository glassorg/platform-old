// import Context from "../../../Context";
// import Column from "./Column";
// import HtmlContext from "../../HtmlContext";
// import { endEdit } from "../EditPopup";

// export default function Style(
//     c: Context,
//     args: { id: string, columns: Column[]}
// ) {
//     const { id, columns } = args
//     const { style, text, end } = HtmlContext(c)

//     style()
//     for (let i = 0; i < columns.length; i++) {
//         let column = columns[i]
//         text(`#${id} .DataTable_Row > *:nth-child(${i + 1}) { ${column.style} }`)
//     }
//     end()
// }