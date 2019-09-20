import HtmlElementFactory from "../html/HtmlElementFactory"

const namespace = "http://www.w3.org/2000/svg"
function factory<T extends SVGElement = SVGElement>(tag: string) {
    return HtmlElementFactory<T>(tag, namespace)
}

export const element = factory<SVGElement>("svg")
export const circle = factory<SVGCircleElement>("circle")
export const line = factory<SVGLineElement>("line")
export const rect = factory<SVGRectElement>("rect")
export const path = factory<SVGPathElement>("path")
export const text = factory<SVGTextElement>("text")
export const use = factory<SVGUseElement>("use")
export const defs = factory<SVGDefsElement>("defs")
export const clipPath = factory<SVGClipPathElement>("clipPath")
export const animateMotion = factory<SVGElement>("animateMotion")
export const g = factory<SVGGElement>("g")
export const mpath = factory("mpath")
