import factories, { HtmlFactories } from "./factories";
import Context from "../Context";
import { Render } from "../Component";

type HtmlContext = { [p in keyof HtmlFactories]: (propertiesOrContent?: object | string, content?: string) => HTMLElement } & {
    end: () => void
    text: (content: string) => void
    render<T>(type: Render<T>, properties?: T)
}

const cacheHtmlContextSymbol = Symbol("platform.ui.html.HtmlContext.cache")

function create(c: Context): HtmlContext {
    let html: any = {
        end: c.end,
        render: c.render,
        text: c.text,
    }

    for (let name in factories) {
        let factory = factories[name]
        html[name] = (propertiesOrContent?: object | string, content?: string) => {
            let properties: object | null = null
            // let content: string | null = null
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

    return html
}

export default function(c: Context): HtmlContext {
    let cachedContext = c[cacheHtmlContextSymbol]
    if (cachedContext == null) {
        cachedContext = c[cacheHtmlContextSymbol] = create(c)
    }
    return cachedContext
}