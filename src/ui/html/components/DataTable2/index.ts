import Column from "./Column"
import Row from "./Row"
import Style from "./Style"
import DataTable from "./DataTable"

const dataTable: typeof DataTable & { Column: typeof Column, Row: typeof Row, Style: typeof Style } = DataTable as any
dataTable.Column = Column
dataTable.Row = Row
dataTable.Style = Style
export default dataTable
