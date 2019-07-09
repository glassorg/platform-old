import Context from "../../Context";
import * as svg from "../../svg";

export default function Loader(c: Context, percent: number) {
    let percentage = percent.toString() + "%"
    c.begin(svg.element, { 
        version: "1.1", baseProfile: "full", 
        width: percentage, height: percentage,
        viewBox: "-150, -150, 300, 300"
    })
        c.begin(svg.path, {
            d: "M0,-40 L-45, 5 L45, 5 z", 
            fill: "white", 
            stroke: "purple", "stroke-width": 5
        })
            c.begin(svg.animateMotion, {
                dur: "5s",
                repeatCount: "indefinite",
                rotate: "auto"
            })
                c.empty(svg.mpath, { href: "#spin"})
            c.end(svg.animateMotion)
        c.end(svg.path)
        c.begin(svg.path, {
            d: "M0,-60 L45,-105 L-45,-105 z", 
            fill: "white", 
            stroke: "purple", "stroke-width": 5
        })
            c.begin(svg.animateMotion, {
                dur: "3s",
                repeatCount: "indefinite",
                rotate: "auto"
            })
                c.empty(svg.mpath, { href: "#spin"})
            c.end(svg.animateMotion)
        c.end(svg.path)
        c.begin(svg.path, {
            d: "M10,-50 L55,-95 L55,-5 z", 
            fill: "white", 
            stroke: "purple", "stroke-width": 5
        })
            c.begin(svg.animateMotion, {
                dur: "3s",
                repeatCount: "indefinite",
                rotate: "auto"
            })
                c.empty(svg.mpath, { href: "#spin"})
            c.end(svg.animateMotion)
        c.end(svg.path)
        c.begin(svg.path, {
            d: "M-10,-50 L-55,-95 L-55,-5 z", 
            fill: "white", 
            stroke: "purple", "stroke-width": 5
        })
            c.begin(svg.animateMotion, {
                dur: "5s",
                repeatCount: "indefinite",
                rotate: "auto"
            })
                c.empty(svg.mpath, { href: "#spin"})
            c.end(svg.animateMotion)
        c.end(svg.path)
        c.empty(svg.path, {
            id: "spin",
            d: "M0 -75 A 50 50, 0, 1, 0, 1 -75 z",
            stroke: "none",
            fill: "none"
        })
    c.end(svg.element)
}