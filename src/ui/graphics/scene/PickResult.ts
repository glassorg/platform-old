import Node from "./Node";
import Vector3 from "../../math/Vector3";

export default class PickResult {

    node: Node
    position: Vector3

    constructor(node: Node, position: Vector3) {
        this.node = node
        this.position = position
    }

}