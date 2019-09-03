
import HtmlElementFactory from "./HtmlElementFactory";

const defaultAttributes = { class: true, type: true }
function factory<T extends HTMLElement>(tag: string, attributes: { [name: string]: boolean } = defaultAttributes) {
    return HtmlElementFactory<T>(tag, attributes)
}

export const h1 = factory<HTMLElement>("h1")
export const h2 = factory<HTMLElement>("h2")
export const h3 = factory<HTMLElement>("h3")
export const h4 = factory<HTMLElement>("h4")
export const h5 = factory<HTMLElement>("h5")
export const h6 = factory<HTMLElement>("h6")
export const hr = factory<HTMLElement>("hr")
export const p = factory<HTMLElement>("p")
export const ol = factory<HTMLElement>("ol")
export const ul = factory<HTMLElement>("ul")
export const li = factory<HTMLElement>("li")
export const dl = factory<HTMLElement>("dl")
export const dt = factory<HTMLElement>("dt")
export const dd = factory<HTMLElement>("dd")
export const div = factory<HTMLElement>("div")
export const span = factory<HTMLElement>("span")
export const footer = factory<HTMLElement>("footer")
export const header = factory<HTMLElement>("header")
export const a = factory<HTMLAnchorElement>("a")
export const img = factory<HTMLImageElement>("img")
export const label = factory<HTMLLabelElement>("label")
export const button = factory<HTMLButtonElement>("button")
export const form = factory<HTMLFormElement>("form")
export const input = factory<HTMLInputElement>("input", {
    ...defaultAttributes,
    pattern: true,
    placeholder: true,
    maxlength: true,
    minlength: true,
    readonly: true,
    size: true,
    spellcheck: true
})
export const select = factory<HTMLSelectElement>("select")
export const option = factory<HTMLOptionElement>("option")
export const style = factory<HTMLStyleElement>("style")
export const textarea = factory<HTMLTextAreaElement>("textarea")
export const canvas = factory<HTMLCanvasElement>("canvas")
export const iframe = factory<HTMLIFrameElement>("iframe")
