import Component from "./Component";
import NodeFactory from "./NodeFactory";

export type NodeConstructor<T extends INode> = new () => T
export type NodeClass<T extends INode> = NodeConstructor<T> & { getFactory(): NodeFactory<T> }
export function isNodeClass<T extends INode = INode>(value): value is NodeClass<T> {
    return value && typeof value.getFactory === "function"
}

export default interface INode {

    //  Composition methods compatible with Html Node
    appendChild(child)
    removeChild(child)
    insertBefore(child, ref)
    lastChild: INode | null
    firstChild: INode | null
    parentNode: INode | null
    nextSibling: INode | null
    previousSibling: INode | null
    // children: Iterable<INode>

    //  Context rendering properties
    component?: Component
    factory?: NodeFactory
    properties?: any

    //  invalidation
    dirty?: boolean

}
