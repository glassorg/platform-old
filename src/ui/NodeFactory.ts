import INode from "./INode";
import Context from "./Context";

type NodeFactory<T extends INode = INode> = {

    text?: NodeFactory
    create(context: Context): T
    setProperties(node: T, properties)
    dispose(node: T): void
    toString(): string

}

export default NodeFactory
