import Context from "../Context";
import { extendElementAsVirtualNodeRoot } from "../VirtualNode";
import { Render } from "../Component";
import * as html from "../html";
import Graphics2D from "./Graphics2D";
import Graphics from "./Graphics";
import Graphics3D from "./Graphics3D";

const contextSymbol = Symbol("context")
function ensureRootRepaintableVirtualNode(c: Context, canvas: HTMLCanvasElement, dimensions: 2 | 3) {
    let previousContext = canvas[contextSymbol]
    if (previousContext != null) {
        if (previousContext !== c) {
            throw new Error("Cannot change the context after creation")
        }
        return
    }
    canvas[contextSymbol] = c

    let graphics: Graphics
    function repaint(time) {
        if (graphics == null) {
            if (dimensions === 2) {
                let context = canvas.getContext("2d")
                if (context instanceof CanvasRenderingContext2D) {
                    graphics = new Graphics2D(context)
                } else {
                    console.error(`Expectd a CanvasRenderingContext2D:`, context)
                }
            } else {
                let context = canvas.getContext("webgl2")
                if (context instanceof WebGL2RenderingContext) {
                    graphics = new Graphics3D(context)
                } else {
                    console.error(`Expectd a WebGL2RenderingContext:`, context)
                }
            }
        }
        if (graphics != null) {
            dirty = false
            graphics.begin()
            for (let node: any = canvas.firstChild; node != null; node = node.nextSibling) {
                if (typeof node.render === "function") {
                    node.render(graphics, time)
                }
            }
            graphics.end()
        }
    }
    let dirty = false
    Object.defineProperties(extendElementAsVirtualNodeRoot(canvas), {
        dirty: {
            get() { return dirty },
            set(value: boolean) {
                if (value !== dirty) {
                    dirty = value
                    if (value) {
                        c.requestAnimationFrame(repaint)
                    }
                }
            }
        }
    })
}

export default function Canvas(c: Context, p: {
    dimensions: 2 | 3,
    component: Render<any>,
    componentArg?: any,
    [name: string]: any
}) {
    let { dimensions, component, componentArg, ...rest } = p
    let canvas = c.begin(html.canvas, rest)
        ensureRootRepaintableVirtualNode(c, canvas, dimensions)
        c.render(component, componentArg)
    c.end(html.canvas)
}
