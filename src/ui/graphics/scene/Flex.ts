import Control from "./Control"
import Rectangle from "../../math/Rectangle"
import INode from "../../INode"

function getChildControls(container: INode) {
    let children: Control[] = []
    for (let child = container.firstChild; child != null; child = child.nextSibling) {
        if (child instanceof Control) {
            children.push(child)
        }
    }
    return children
}

function layout(
    container: Control,
    axisOffset,
    axisLength,
    crossOffset,
    crossLength,
    bounds: Rectangle = new Rectangle(0, 0, container.width, container.height).subtract(container.padding),
) {
    let x = bounds[axisOffset]
    let width = bounds[axisLength]
    let y = bounds[crossOffset]
    let height = bounds[crossLength]
    // for now just divide the space and lay them out.
    //  TODO: take minimum, optimum, maximum sizes into account
    let children = getChildControls(container)
    let sizeEach = Math.floor(width / children.length)
    for (let child of children) {
        let bounds = new Rectangle(0, 0, 0, 0)
        bounds[axisOffset] = x
        bounds[axisLength] = sizeEach
        bounds[crossOffset] = y
        bounds[crossLength] = height
        child.bounds = bounds.subtract(child.margin)
        x += sizeEach
    }
}

export function vertical(container: Control, bounds?: Rectangle) {
    layout(container, "y", "height", "x", "width", bounds)
}

export function horizontal(container: Control, bounds?: Rectangle) {
    layout(container, "x", "width", "y", "height", bounds)
}
