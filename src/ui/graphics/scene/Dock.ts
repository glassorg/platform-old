import Control from "./Control"
import Rectangle from "../../math/Rectangle"

enum Dock {
    top = "top",
    left = "left",
    right = "right",
    bottom = "bottom",
    fill = "fill",
    none = "none",
}

const options = {
    top(child: Control, bounds: Rectangle) {
        let height = (child.optimumSize || child.size).add(child.margin).height
        Object.assign(child, new Rectangle(bounds.x, bounds.y, bounds.width, height).subtract(child.margin))
        return new Rectangle(bounds.x, bounds.y + height, bounds.width, bounds.height - height)
    },
    bottom(child: Control, bounds: Rectangle) {
        let height = (child.optimumSize || child.size).add(child.margin).height
        Object.assign(child, new Rectangle(bounds.x, bounds.bottom - height, bounds.width, height).subtract(child.margin))
        return new Rectangle(bounds.x, bounds.y, bounds.width, bounds.height - height)
    },
    left(child: Control, bounds: Rectangle) {
        let width = (child.optimumSize || child.size).add(child.margin).width
        Object.assign(child, new Rectangle(bounds.x, bounds.y, width, bounds.height).subtract(child.margin))
        return new Rectangle(bounds.x + width, bounds.y, bounds.width - width, bounds.height)
    },
    right(child: Control, bounds: Rectangle) {
        let width = (child.optimumSize || child.size).add(child.margin).width
        Object.assign(child, new Rectangle(bounds.right - width, bounds.y, width, bounds.height).subtract(child.margin))
        return new Rectangle(bounds.x, bounds.y, bounds.width - width, bounds.height)
    },
    fill(child: Control, bounds: Rectangle) {
        Object.assign(child, bounds.subtract(child.margin))
        return bounds
    },
    none(child: Control, bounds: Rectangle) {
        return bounds
    }
}

export function layout(
    container: Control,
    bounds: Rectangle = new Rectangle(0, 0, container.width, container.height).subtract(container.padding)
) {
    for (let child = container.firstChild; child != null; child = child.nextSibling) {
        if (child instanceof Control) {
            let layout = options[child.layout] || options.none
            bounds = layout(child, bounds)
        }
    }
}

export default Dock
