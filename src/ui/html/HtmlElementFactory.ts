import NodeFactory from "../NodeFactory";
import INode from "../INode";
import Context from "../Context";
import HtmlTextNodeFactory from "./HtmlTextNodeFactory";

export type Attributes = { [attribute: string]: any }

export default class HtmlElementFactory<T extends Element> extends NodeFactory<T> {

    public text = HtmlTextNodeFactory.instance
    private tagName: string
    private attributes?: Attributes
    private namespace?: string

    constructor(tagName: string, namespaceOrAttributes: string | Attributes) {
        super()
        this.tagName = tagName
        if (typeof namespaceOrAttributes === "string") {
            this.namespace = namespaceOrAttributes
        } else {
            this.attributes = namespaceOrAttributes
        }
    }

    create(c: Context): T {
        if (this.namespace) {
            return c.document.createElementNS(this.namespace, this.tagName) as any
        } else {
            return c.document.createElement(this.tagName) as any
        }
    }

    isAttribute(name, value, previousValue) {
        if (typeof value === "function" || typeof previousValue === "function") {
            return false
        }
        return this.attributes == null || this.attributes[name] === true
    }

    setProperties(node: T & INode, properties: object | null) {
        const attributes = this.attributes
        const previousProperties = node.properties as object | null
        if (properties != null) {
            for (let name in properties) {
                let value = properties[name]
                let previousValue = previousProperties != null ? previousProperties[name] : undefined
                if (previousValue != value /* != on purpose */) {
                    if (this.isAttribute(name, value, previousValue)) {
                        if (value != null) {
                            node.setAttribute(name, value)
                        } else {
                            node.removeAttribute(name)
                        }
                    } else {
                        node[name] = value
                    }
                }
            }
        }
        if (previousProperties != null) {
            for (let name in previousProperties) {
                let previousValue = previousProperties[name]
                if (properties == null || !properties.hasOwnProperty(name)) {
                    let value = properties != null ? properties[name] : undefined
                    if (this.isAttribute(name, value, previousValue)) {
                        node.removeAttribute(name)
                    } else {
                        node[name] = null
                    }
                }
            }
        }
        node.properties = properties
    }

    dispose(node: T): void {
    }

    toString() {
        return `HtmlNodeFactory(${this.tagName})`
    }

}
