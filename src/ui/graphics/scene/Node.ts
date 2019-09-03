import VirtualNode from "../../VirtualNode";
import Graphics from "../Graphics";

export class Node extends VirtualNode {

    render(g: Graphics, time) {
        this.dirty = false
        this.draw(g, time)
    }

    draw(g: Graphics, time) {
        for (let node = this.firstChild; node != null; node = node.nextSibling) {
            if (node instanceof Node) {
                node.render(g, time)
            }
        }
    }

}

export default Node.getFactory<Node>()