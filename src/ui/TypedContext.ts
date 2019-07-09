import NodeFactory from "./NodeFactory";
import Context from "./Context";
import { Render } from "./Component";
import INode from "./INode";

type Factories = { [p: string]: NodeFactory }
const symbolSymbol = Symbol("TypedContext.symbolSymbol")

export default class TypedContext {

    end: () => void
    render: <T>(type: Render<T>, properties?: T) => void
    text: (content: string) => void

    constructor(c: Context, factories: Factories) {
        this.end = c.end as any
        this.render = c.render
        this.text = c.text
        for (let name in factories) {
            let factory = factories[name]
            this[name] = (propertiesOrContent?: object | string, content?: string) => {
                let properties: object | null = null
                if (typeof propertiesOrContent === "object") {
                    properties = propertiesOrContent
                } else if (typeof propertiesOrContent === "string") {
                    content = propertiesOrContent
                }
                let element = c.begin(factory, properties)
                if (content != null) {
                    c.text(content)
                    c.end(factory)
                }
                return element
            }
        }
    }

    static create<F extends Factories>(c: Context, f: F): TypedContext & { [p in keyof F]: (propertiesOrContent?: object | string, content?: string) => INode } {
        let symbol = (f as any)[symbolSymbol]
        if (symbol == null) {
            symbol = (f as any)[symbolSymbol] = Symbol()
        }
        let cachedContext = c[symbol]
        if (cachedContext == null) {
            cachedContext = c[symbol] = new TypedContext(c, f)
        }
        return cachedContext
    }

}
