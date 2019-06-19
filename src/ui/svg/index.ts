import HtmlElementFactory from "../html/HtmlElementFactory";
import INode from "../INode";

const namespace = "http://www.w3.org/2000/svg"
function factory<T extends SVGElement = SVGElement>(tag: string) {
    return new HtmlElementFactory<T>(tag, namespace)
}

class SvgElementFactory extends HtmlElementFactory<SVGElement> {

    public circle = factory<SVGCircleElement>("circle")
    public line = factory<SVGLineElement>("line")
    public rect = factory<SVGRectElement>("rect")
    public path = factory<SVGPathElement>("path")
    public text = factory<SVGTextElement>("text")
    public use = factory<SVGUseElement>("use")
    public defs = factory<SVGDefsElement>("defs")
    public clipPath = factory<SVGClipPathElement>("clipPath")
    public animateMotion = factory<SVGElement>("animateMotion")
    public g = factory<SVGGElement>("g")
    public mpath = factory("mpath")

    constructor() {
        super("svg", namespace)
    }

}

export default new SvgElementFactory()
