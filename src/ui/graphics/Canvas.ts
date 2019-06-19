import Context from "../Context";
import { extendElementAsVirtualNodeRoot } from "../VirtualNode";
import { Render } from "../Component";
import * as html from "../html";
import Graphics2D from "./Graphics2D";
import Graphics from "./Graphics";
import Graphics3D from "./Graphics3D";
import Pickable, { isPickable } from "./scene/Pickable";
import Vector3 from "../math/Vector3";
import { getPosition } from "../html/functions";
import Capsule from "../math/Capsule";
import Sphere from "../math/Sphere";

function bindMouseEvents(canvas: HTMLCanvasElement) {
    let mouseTarget: Pickable | null = null
    function pick(e: MouseEvent) {
        let firstChild = canvas.firstChild
        if (isPickable(firstChild)) {
            let front = getPosition(e)
            let back = new Vector3(front.x, front.y, 1)
            let ray = new Capsule(new Sphere(front, 0), new Sphere(back, 0))
            let picked = firstChild.pick(ray)
            if (mouseTarget !== picked) {
                if (mouseTarget && mouseTarget.onmouseout) {
                    mouseTarget.onmouseout(e)
                }
                mouseTarget = picked
                if (mouseTarget && mouseTarget.onmouseover) {
                    mouseTarget.onmouseover(e)
                }
            }
            return mouseTarget
        }
        return null
    }

    // add some event routing
    for (let event of ["mousedown", "mouseup", "mousemove", "click"]) {
        canvas.addEventListener(event, (e: any) => {
            let target = pick(e)
            if (target && target[event]) {
                target[event](e)
            }
        })
    }
}

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

    bindMouseEvents(canvas)

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
    return repaint
}

export default function Canvas(c: Context, p: {
    dimensions: 2 | 3,
    component: Render<any>,
    componentArg?: any,
    [name: string]: any
}) {
    let { dimensions, component, componentArg, ...rest } = p
    let canvas = c.begin(html.canvas, rest)
        let repaint = ensureRootRepaintableVirtualNode(c, canvas, dimensions)
        c.render(component, componentArg)
        if (repaint) {
            repaint(0)
        }
    c.end(html.canvas)
}
