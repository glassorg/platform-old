import NodeFactory from "./NodeFactory";
import Component from "./Component";
import Context from "./Context";
import INode, { NodeClass, isNodeClass } from "./INode";
import { memoize } from "../utility/common";

export function extendElementAsVirtualNodeRoot<T>(element: T): T & INode {
    return Object.defineProperties(element, {
        firstChild: {
            writable: true,
            value: null
        },
        lastChild: {
            writable: true,
            value: null
        },
        appendChild: {
            value: VirtualNode.prototype.appendChild
        },
        removeChild: {
            value: VirtualNode.prototype.removeChild
        },
        insertBefore: {
            value: VirtualNode.prototype.insertBefore
        }
    })
}

export default class VirtualNode implements INode {

    parentNode: INode | null = null
    firstChild: INode | null = null
    lastChild: INode | null = null
    nextSibling: INode | null = null
    previousSibling: INode | null = null

    component?: Component
    factory?: NodeFactory
    properties?: any
    dirty: boolean = false

    // composition methods compatible with Html Node
    appendChild<T extends INode>(child: T): T {
        return this.insertBefore(child, null)
    }
    removeChild<T extends INode>(child: T): T {
        if (child.parentNode !== this) {
            throw new Error("node is not a child of this parentNode.")
        }
        if (this.firstChild === child) {
            this.firstChild = child.nextSibling
        }
        if (this.lastChild === child) {
            this.lastChild = child.previousSibling
        }
        if (child.previousSibling != null) {
            child.previousSibling.nextSibling = child.nextSibling
        }
        if (child.nextSibling != null) {
            child.nextSibling.previousSibling = child.previousSibling
        }
        child.parentNode = null
        child.previousSibling = null
        child.nextSibling = null
        return child
    }
    insertBefore<T extends INode>(child: T, ref: INode | null): T {
        if (child.parentNode != null) {
            child.parentNode.removeChild(child)
        }
        if (ref == null) {
            child.previousSibling = this.lastChild
            if (child.previousSibling != null) {
                child.previousSibling.nextSibling = child
            }
            if (this.firstChild == null) {
                this.firstChild = child
            }
            this.lastChild = child
        } else {
            if (ref.parentNode !== this) {
                throw new Error("Reference node is not a child")
            }
            child.previousSibling = ref.previousSibling
            if (child.previousSibling != null) {
                child.previousSibling.nextSibling = child
            }
            child.nextSibling = ref
            ref.previousSibling = child
            if (this.firstChild === ref) {
                this.firstChild = child
            }
        }
        child.parentNode = this
        return child
    }

    public static getFactory(): NodeFactory {
        return VirtualNodeFactory.getInstance(this as NodeClass<VirtualNode>)
    }

    markDirty() {
        for (let node: INode | null= this; node != null && node.dirty === false; node = node.parentNode) {
            node.dirty = true
        }
    }

}

class VirtualNodeFactory<T extends VirtualNode> {

    nodeClass: NodeClass<T>

    constructor(nodeClass: NodeClass<T>) {
        this.nodeClass = nodeClass
    }

    create(context: Context): T {
        return new this.nodeClass
    }

    setProperties(node: T, properties) {
        Object.assign(node, properties)
        node.markDirty()
    }

    dispose(node: T): void {
        // TODO: Actually recycle the instance.
    }

    static getInstance = memoize((nodeClass: NodeClass<VirtualNode>) => {
        return new VirtualNodeFactory(nodeClass)
    })

}

