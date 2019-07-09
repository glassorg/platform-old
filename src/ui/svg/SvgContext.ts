import svg, { SvgFactories } from "./";
import Context from "../Context";
import TypedContext from "../TypedContext";

export default function(c: Context) {
    return TypedContext.create<SvgFactories>(c, svg)
}