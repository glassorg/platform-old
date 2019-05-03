import VirtualNode from "../../VirtualNode";
import Graphics from "../Graphics";

export default class SceneNode extends VirtualNode {

    render(g: Graphics, time) {
        this.dirty = false
        this.draw(g, time)
    }

    draw(g: Graphics, time) {
        for (let node = this.firstChild; node != null; node = node.nextSibling) {
            if (node instanceof SceneNode) {
                node.render(g, time)
            }
        }
    }

}