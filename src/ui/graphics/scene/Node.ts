import VirtualNode from "../../VirtualNode";
import Graphics from "../Graphics";

export class Node extends VirtualNode {

    draw(g: Graphics) {
        for (let node = this.firstChild; node != null; node = node.nextSibling) {
            if (node instanceof Node) {
                node.draw(g)
            }
        }
        this.dirty = false
    }

}

export default Node.getFactory<Node>()