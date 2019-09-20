import VirtualNode from "../../VirtualNode";
import Graphics from "../Graphics";

export default class Node extends VirtualNode {

    draw(g: Graphics) {
        for (let node = this.firstChild; node != null; node = node.nextSibling) {
            if (node instanceof Node) {
                node.draw(g)
            }
        }
        this.dirty = false
    }

}