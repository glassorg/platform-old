import NodeFactory from "../NodeFactory"
import INode from "../INode"
import Context from "../Context"
import HtmlTextNodeFactory from "./HtmlTextNodeFactory"

export type Attributes = { [attribute: string]: any }
const ignoreProperties = { content: true }
type Content = string | ((c: Context) => void)

export default function HtmlElementFactory<T extends Element>(
    tagName: string,
    namespaceOrAttributes: string | Attributes
) {

    let attributes: Attributes | null = null
    let namespace: string | null = null
    if (typeof namespaceOrAttributes === "string") {
        namespace = namespaceOrAttributes
    } else {
        attributes = namespaceOrAttributes
    }

    function isAttribute(name, value, previousValue) {
        if (typeof value === "function" || typeof previousValue === "function") {
            return false
        }
        return attributes == null || attributes[name] === true
    }

    let factory = {
        text: HtmlTextNodeFactory.instance,
        create(c: Context): T {
            if (namespace) {
                return c.document.createElementNS(namespace, tagName) as any
            } else {
                return c.document.createElement(tagName) as any
            }
        },
        setProperties(node: T & INode, properties: object | null = null) {
            const previousProperties = node.properties as object | null
            if (properties != null) {
                for (let name in properties) {
                    if (!ignoreProperties[name]) {
                        let value = properties[name]
                        let previousValue = previousProperties != null ? previousProperties[name] : undefined
                        if (previousValue != value /* != on purpose */) {
                            if (isAttribute(name, value, previousValue)) {
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
            }
            if (previousProperties != null) {
                for (let name in previousProperties) {
                    if (!ignoreProperties[name]) {
                        let previousValue = previousProperties[name]
                        if (properties == null || !properties.hasOwnProperty(name)) {
                            let value = properties != null ? properties[name] : undefined
                            if (isAttribute(name, value, previousValue)) {
                                node.removeAttribute(name)
                            } else {
                                node[name] = null
                            }
                        }
                    }
                }
            }
            node.properties = properties
        },
        dispose(node: T): void {
        },
        toString() {
            return `HtmlNodeFactory(${tagName})`
        }
    }

    function renderElement(properties?: object | Content): T {
        let c = Context.current
        let content: Content | null = null
        if (typeof properties !== "object") {
            content = properties as any
            properties = null as any
        } else if (properties) {
            content = properties["content"]
        }
        let element = c.begin(factory, properties)
        if (typeof content === "function") {
            content(c)
        } else if (typeof content === "string") {
            c.text(content)
        } else if (content != null) {
            throw new Error(`Unsupported content type: ${content}`)
        }
        c.end(factory)

        // return element as unknown as HTMLElement
        return element as T
    }

    return Object.assign(renderElement, factory)

}
