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

    markDirty() {
        for (let node: INode | null= this; node != null && node.dirty === false; node = node.parentNode) {
            node.dirty = true
        }
    }

    private static getFactory<T extends VirtualNode>(this: NodeClass<T>): NodeFactory<T> & Render<T> {
        return getFactoryInstance(this) as any
    }

    public static node<T extends new(...any) => any>(this: T, properties?: Properties<InstanceType<T>>) {
        return getFactoryInstance(this as any)(properties)
    }

}

type Properties<T> = { [P in keyof T]?: T[P] } & { content?: Content }
type Render<T> = (properties?: Properties<T> | Content) => void
type Content = (c: Context) => void

const getFactoryInstance = memoize(function <T extends VirtualNode>(nodeClass: NodeClass<T>) {
    const factory = {
        create(context: Context): T {
            return new nodeClass
        },
        setProperties(node: T, properties) {
            Object.assign(node, properties)
            node.markDirty()
        },
        dispose(node: T): void {
            // TODO: Actually recycle the instance.
        }
    }

    function renderElement(properties?: Properties<T> | Content): T {
        let c = Context.current
        let content: Content | null = null
        if (typeof properties !== "object") {
            content = properties as any
            properties = null as any
        }
        else if (properties) {
            content = properties.content!
        }
        let element = c.begin(factory, properties)
        if (typeof content === "function") {
            content(c)
        }
        else if (content != null) {
            throw new Error(`Unsupported content type: ${content}`)
        }
        c.end(factory)

        return element as T
    }

    return Object.assign(renderElement, factory) as NodeFactory<T> & Render<T>
})

class Foo {
    x?: number
    y?: number

    static render<T extends new () => InstanceType<T>>(this: T): InstanceType<T> {
        return null as any
    }
}

// Foo.render().x
