import INode from "./INode";
import Context from "./Context";

export default abstract class NodeFactory<T extends INode = INode> {

    text?: NodeFactory
    abstract create(context: Context): T
    abstract setProperties(node: T, properties)
    abstract dispose(node: T): void

}
