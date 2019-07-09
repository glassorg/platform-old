import HtmlElementFactory from "./HtmlElementFactory";
import INode from "../INode";

const defaultAttributes = { class: true, type: true }
function factory<T extends HTMLElement>(tag: string, attributes: { [name: string]: boolean } = defaultAttributes) {
    return new HtmlElementFactory<T>(tag, attributes)
}

export class HtmlFactories {
    h1 = factory<HTMLElement>("h1")
    h2 = factory<HTMLElement>("h2")
    h3 = factory<HTMLElement>("h3")
    h4 = factory<HTMLElement>("h4")
    h5 = factory<HTMLElement>("h5")
    h6 = factory<HTMLElement>("h6")
    ol = factory<HTMLElement>("ol")
    ul = factory<HTMLElement>("ul")
    li = factory<HTMLElement>("li")
    dl = factory<HTMLElement>("dl")
    dd = factory<HTMLElement>("dd")
    dt = factory<HTMLElement>("dt")
    hr = factory<HTMLElement>("hr")
    p = factory<HTMLElement>("p")
    div = factory<HTMLElement>("div")
    span = factory<HTMLElement>("span")
    footer = factory<HTMLElement>("footer")
    header = factory<HTMLElement>("header")
    a = factory<HTMLAnchorElement>("a")
    img = factory<HTMLImageElement>("img")
    label = factory<HTMLLabelElement>("label")
    button = factory<HTMLButtonElement>("button")
    form = factory<HTMLFormElement>("form")
    input = factory<HTMLInputElement>("input", {
        ...defaultAttributes,
        pattern: true,
        placeholder: true,
        maxlength: true,
        minlength: true,
        readonly: true,
        size: true,
        spellcheck: true
    })
    select = factory<HTMLSelectElement>("select")
    option = factory<HTMLOptionElement>("option")
    style = factory<HTMLStyleElement>("style")
    textarea = factory<HTMLTextAreaElement>("textarea")
    canvas = factory<HTMLCanvasElement>("canvas")
    iframe = factory<HTMLIFrameElement>("iframe")
}

export default new HtmlFactories()