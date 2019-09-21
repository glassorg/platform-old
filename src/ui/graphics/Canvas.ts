import Context from "../Context"
import { extendElementAsVirtualNodeRoot } from "../VirtualNode"
import * as html from "../html"
import Graphics2D from "./Graphics2D"
import Graphics from "./Graphics"
import Graphics3D from "./Graphics3D"
// import Pickable, { isPickable } from "./scene/Pickable"
import Vector3 from "../math/Vector3"
import { getPosition } from "../html/functions"
import Capsule from "../math/Capsule"
import Sphere from "../math/Sphere"
import Node from "./scene/Node"
import Dock, { layout } from "./scene/Dock"
import WindowSize from "../input/WindowSize"

function bindPointerEvents(canvas: HTMLCanvasElement) {
    // let pointerTarget: Pickable | null = null
    function pick(e: PointerEvent) {
        let firstChild = canvas.firstChild
        // if (isPickable(firstChild)) {
        //     let position = getPosition(e)
        //     let front = new Vector3(position.x, position.y, 0)
        //     let back = new Vector3(position.x, position.y, 1)
        //     let ray = new Capsule(new Sphere(front, 0), new Sphere(back, 0))
        //     let picked = firstChild.pick(ray)
        //     if (pointerTarget !== picked) {
        //         if (pointerTarget && pointerTarget.onpointerout) {
        //             pointerTarget.onpointerout(e)
        //         }
        //         pointerTarget = picked
        //         if (pointerTarget && pointerTarget.onpointerover) {
        //             pointerTarget.onpointerover(e)
        //         }
        //     }
        //     return pointerTarget
        // }
        return null
    }

    // add some event routing
    for (let event of ["pointerdown", "pointerup", "pointermove"]) {
        canvas.addEventListener(event, (e: any) => {
            let target = pick(e)
            if (target && target[event]) {
                // target[event](e)
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

    bindPointerEvents(canvas)

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
            graphics.begin()
            // layout any children using the Dock layout.
            layout(canvas as any)
            for (let node: any = canvas.firstChild; node != null; node = node.nextSibling) {
                if (node instanceof Node) {
                    node.draw(graphics)
                }
            }
            graphics.end()
            dirty = false
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

export default Context.component(function Canvas(c: Context, p: {
    dimensions?: 2 | 3,
    content: (c: Context) => void,
    width?: number,
    height?: number,
    class?: string,
    style?: string,
}) {
    let { dimensions, content, ...rest } = p
    let canvas = c.begin(html.canvas, rest)
        let repaint = ensureRootRepaintableVirtualNode(c, canvas, dimensions = dimensions || 2)
        content(c)
        if (repaint) {
            repaint(0)
        }
    c.end(html.canvas)
})
