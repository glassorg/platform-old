import INode, { NodeClass, isNodeClass } from "./INode"
import Component, { Render } from "./Component"
import DefaultStore from "../data/stores/DefaultStore"
import Store from "../data/Store"
import NodeFactory from "./NodeFactory"
import localize from "./localize"
import bindComponentToDom from "./html/bindComponentToDom"
import SoundContext from "./sound/SoundContext"
import { bindEventListeners } from "./html/functions"

export type ComponentEventHandler = (component: Component) => void

function quickPropertyEquals(a, b) {
    if (a === b)
        return true
    if (a == null || b == null || typeof a !== "object" || a.constructor !== b.constructor)
        return false
    if (Array.isArray(a)) {
        if (a.length !== b.length)
            return false
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i])
                return false
        }
    } else {
        for (let name in a) {
            if (a[name] !== b[name])
                return false
        }
        for (let name in b) {
            if (a[name] !== b[name])
                return false
        }
    }
    return true
}

export default class Context {

    private elements: Array<INode | null>
    private renderStack: Component[] = []
    public onDispose?: ComponentEventHandler
    public store: DefaultStore = Store.default
    public sound: SoundContext = new SoundContext()
    public document: Document
    public localize = localize

    constructor(root: INode & HTMLElement | HTMLElement = document.body) {
        this.elements = [root as INode, null]
        if (root.ownerDocument == null) {
            throw new Error("Node is not in a document")
        }
        this.document = root.ownerDocument

        // bind some of the members likely to be used without this.
        this.begin = this.begin.bind(this) as any
        this.text = this.text.bind(this)
        this.end = this.end.bind(this)
        this.empty = this.empty.bind(this) as any
        this.render = this.render.bind(this) as any
    }

    ////////////////////////////////////////////////////////////////////////////////
    //  BEGIN STATS
    ////////////////////////////////////////////////////////////////////////////////
    resetStats() {
        this.recycled = 0
        this.created = 0
        this.removed = 0
        this.skipped = 0
        this.createdComponents = 0
        this.removedComponents = 0
    }
    recycled = 0
    created = 0
    removed = 0
    skipped = 0
    createdComponents = 0
    removedComponents = 0
    ////////////////////////////////////////////////////////////////////////////////
    //  END STATS
    ////////////////////////////////////////////////////////////////////////////////

    begin<T extends INode>(factory: NodeFactory<T>, properties?) {
        if (!this.isRendering)
            throw new Error("Invalid attempt to render without beginRender / endRender")
        // let factory = isNodeClass(classOrFactory) ? classOrFactory.getFactory() : classOrFactory
        // we recycle nodes if they come from the same factory
        const maybeRecycle = this.insertBefore as T
        let node: T | null = maybeRecycle != null && maybeRecycle.factory === factory ? maybeRecycle : null
        if (node == null) {
            //  create a new node
            this.created++
            node = factory.create(this as any)
            node.factory = factory
            this.insert(node)
        } else {
            //  recycle a previous node
            this.recycled++
            this.disposeOfAnyComponents(node)
        }
        factory.setProperties(node, properties)
        this.push(node)
        return node
    }

    end<T extends INode>(factory: NodeFactory<T>) {
        if (factory != null) {
            if (this.parentNode.factory !== factory) {
                throw new Error("Begin and end node factories do not match")
            }
        }
        //  remove any remaining children following the insert after
        let remove: INode | null
        while (remove = this.insertBefore) {
            this.disposeOfAnyComponents(remove, true)
            this.removed++
            this.parentNode.removeChild(remove)
        }
        this.pop()
    }

    // /**
    //  * Begins and ends a new empty node.
    //  * @param nodeClass
    //  * @param properties
    //  */
    // empty<T extends INode>(nodeClass: NodeClass<T>, properties?) : T
    /**
     * Begins and ends a new empty node.
     * @param factory
     * @param properties
     */
    empty<T extends INode>(factory: NodeFactory<T>, properties?: any) : T
    // /**
    //  * Begins and ends a new empty node.
    //  * @param factory
    //  * @param properties
    //  */
    // empty<T>(render: Render<T>, properties?: T): void
    /**
     * Begins and ends a new node containing text content.
     * @param factory 
     * @param properties 
     * @param content 
     */
    empty<T extends INode>(factory: NodeFactory<T>, properties: any, content: string): T
    /**
     * Begins and ends a new node optionally containing content.
     * @param factory 
     * @param propertiesOrContent 
     * @param content 
     */
    empty<T,NT extends INode = INode>(factory: NodeFactory<NT>, propertiesOrContent?: any, content?: string) {
        let node
        if (typeof propertiesOrContent === "string") {
            node = this.begin(factory)
            this.text(propertiesOrContent)
        } else {
            node = this.begin(factory, propertiesOrContent)
            if (content != null) {
                this.text(content)
            }
        }
        this.end(factory)
        return node as NT
    }

    text(content: string) {
        let textFactory = this.parentNode.factory!.text
        if (textFactory == null) {
            throw new Error("Cannot add text content to current node.")
        }
        let node = this.begin(textFactory, content)
        this.end(textFactory)
        return node
    }

    get component(): Component | undefined {
        return this.renderStack[this.renderStack.length - 1]
    }

    private disposeOfAnyComponents(node: INode, deep: boolean = false) {
        for (let component = node.component; component != null; component = component.next) {
            if (component) {
                this.removedComponents++
            }
            // recursively search for and dispose of any descendant components
            if (deep) {
                for (let child: INode | null = node.firstChild; child != null; child = child.nextSibling) {
                    this.disposeOfAnyComponents(child, deep)
                }
            }
            if (component.dispose) {
                component.dispose()
            }
            if (this.onDispose) {
                this.onDispose(component)
            }
            component.node = null
            delete node.component
        }
    }

    //  need a way to request a notification after normal rendering
    requestAnimationFrame(callback: (time) => void) {
        if (this.isRendering) {
            this.postRenderCallbacks.add(callback)
        } else {
            window.requestAnimationFrame(callback)
        }
    }

    postRenderCallbacks = new Set<Function>()
    isRendering: boolean = false
    private static currentStack: Context[] = []
    static get current() {
        return Context.currentStack[Context.currentStack.length - 1]
    }
    beginRender(parentNode: INode, insertAfterNode: INode | null = null) {
        Context.currentStack.push(this)
        this.isRendering = true
        this.elements[0] = parentNode
        this.elements[1] = insertAfterNode
        this.elements.length = 2
    }
    endRender() {
        this.isRendering = false
        Context.currentStack.pop()
    }
    rerender(components: Set<Component>, time) {
        for (let component of components) {
            let node = component.node
            // if the node or parentNode is null then this component has already been disposed
            if (node != null) {
                let rootComponent = node.component
                if (rootComponent != null) {
                    // reset the stack so we can re-render over the previous node
                    this.beginRender(node.parentNode!, node.previousSibling)
                    this.render(rootComponent.render, rootComponent.properties, true)
                    this.endRender()
                }
            }
        }
        if (this.postRenderCallbacks.size > 0) {
            for (let callback of this.postRenderCallbacks) {
                callback(time)
            }
            this.postRenderCallbacks.clear()
        }
    }

    render<T>(type: Render<T>, properties?: T, forceRenderBecauseStateChanged = false): INode {
        if (!this.isRendering)
            throw new Error("Invalid attempt to render without beginRender / endRender")
        let parentNode = this.parentNode
        let insertAfter = this.insertAfter
        let insertBefore = this.insertBefore
        let previousComponent = insertBefore && insertBefore.component
        if (!forceRenderBecauseStateChanged && previousComponent && previousComponent.render === type && quickPropertyEquals(previousComponent.properties, properties)) {
            //  early exit... just skip node
            this.skipped++
            this.insertAfter = insertBefore
        } else {
            this.createdComponents++
            //  create new Component
            let component: Component = { render: type, properties, node: null }
            this.renderStack.push(component)
            let maybeDispose = component.render(this as any, properties)
            if (maybeDispose) {
                if (typeof maybeDispose === "object") {
                    maybeDispose = bindEventListeners(maybeDispose)
                }
                if (typeof maybeDispose !== "function") {
                    throw new Error("Component render functions can only return a dispose function or nothing")
                }
                component.dispose = maybeDispose
            }
            this.renderStack.pop()
            let firstNode = (insertAfter ? insertAfter.nextSibling : parentNode.firstChild)
            if (firstNode == null || insertAfter === this.insertAfter)
                throw new Error(`Component must render one node: ${type.toString()}`)
            if (firstNode.component != null) {
                //  nested components
                //  child components are first but we want most ancestral component on top
                //  so we replace component on node
                component.next = firstNode.component
            }
            firstNode.component = component
            component.node = firstNode
            let lastNode = this.insertAfter
            if (lastNode !== firstNode)
                throw new Error("Component cannot render more than one node")
        }
        return this.insertAfter!
    }

    private push(element: INode) {
        this.insertAfter = element
        this.elements.push(element, null)
    }
    private pop() { this.elements.length -= 2 }
    private get parentNode(): INode { return this.elements[this.elements.length - 2] as INode }
    private insert<T extends INode>(node: T) {
        this.parentNode.insertBefore(node, this.insertBefore)
        return node
    }
    private get insertAfter(): INode | null { return this.elements[this.elements.length - 1] }
    private set insertAfter(element: INode | null) { this.elements[this.elements.length - 1] = element }
    private get insertBefore() {
        let insertAfter = this.insertAfter
        let insertBefore = insertAfter != null ? insertAfter.nextSibling : this.parentNode.firstChild
        return insertBefore
    }
    public get lastNode() { return this.insertAfter }

    public static bind<T>(render: Render<T>, arg?: T, container: HTMLElement = document.body) {
        if (container == null) {
            throw new Error("document.body must be defined before calling this function")
        }
        bindComponentToDom(container, render as any, arg)
    }

    public static component<T>(render: (c: Context) => void): () => INode
    public static component<T>(render: (c: Context, p: T) => void): (p: T) => INode
    public static component<T>(render: (c: Context, p: T) => void): (p: T) => INode {
        return (properties: T) => {
            return Context.current.render(render, properties)
        }
    }

}

/**
 * Alternative way to convert a render function to a component function.
 * Javascript doesn't yet have a standard proposal for function declarators though.
 * So this is not useful yet.
 */
export const component = Context.component