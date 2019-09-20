import INode from "../../INode"
import Control from "./Control"

enum Dock {
    top = "top",
    left = "left",
    right = "right",
    bottom = "bottom",
    fill = "fill",
    none = "none",
}

export function dockLayout(container: INode, size: { width: number, height: number } = container as any) {
    let x = 0
    let y = 0
    let width = size.width
    let height = size.height
    for (let child = container.firstChild; child != null; child = child.nextSibling) {
        if (child instanceof Control) {
            if (child.layout != null) {
                if (child.layout === Dock.fill) {
                    child.x = x
                    child.y = y
                    child.width = width
                    child.height = height
                }
            }
        }
    }
}

export default Dock
