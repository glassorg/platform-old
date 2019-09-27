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

function bindPointerEvents(canvas: HTMLCanvasElement) {
    let pointerTarget: Node | null = null
    function pick(e: PointerEvent) {
        let firstChild = canvas.firstChild
        if (firstChild instanceof Node) {
            let position = getPosition(e)
            let front = new Vector3(position.x, position.y, 0)
            let back = new Vector3(position.x, position.y, 1)
            let ray = new Capsule(new Sphere(front, 0), new Sphere(back, 0))
            let picked = firstChild.pick(ray)
            // console.log("picked: ", picked ? { id: picked.node.id, x: picked.position.x, y: picked.position.y } : null)
            let pickedNode = picked ? picked.node : null
            if (pointerTarget !== pickedNode) {
                if (pointerTarget && pointerTarget.onpointerout) {
                    pointerTarget.onpointerout(e)
                }
                pointerTarget = pickedNode
                if (pointerTarget && pointerTarget.onpointerover) {
                    pointerTarget.onpointerover(e)
                }
            }
            return pointerTarget
        }
        return null
    }

    // add some event routing
for (let event of ["pointerdown", "pointerup", "pointermove"]) {
        canvas.addEventListener(event, (e: any) => {
            let target = pick(e)
            if (target && target[event]) {
                target[event](e)
            }
        })
    }
}

const contextSymbol = Symbol("context")
function ensureRootRepaintableVirtualNode(c: Context, canvas: HTMLCanvasElement, dimensions: 2 | 3, testPerformance = 0) {
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
    function repaint() {
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
            let time = Date.now()
            if (start == null) {
                start = time
            }
            graphics.time = (time - start) / 1000
            // layout any children using the Dock layout.
            let animating = testPerformance ? true : false
            let count = testPerformance || 1
            let testStart = Date.now()
            for (let i = 0; i < count; i++) {
                graphics.begin()
                layout(canvas as any)
                for (let node: any = canvas.firstChild; node != null; node = node.nextSibling) {
                    if (node instanceof Node) {
                        if (node.update(graphics)) {
                            animating = true
                        }
                    }
                }
                for (let node: any = canvas.firstChild; node != null; node = node.nextSibling) {
                    if (node instanceof Node) {
                        node.render(graphics)
                    }
                }
                graphics.end()
            }
            let testStop = Date.now()
            if (testPerformance) {
                let testSeconds = (testStop - testStart) / 1000
                let fps = Math.round(count / (testSeconds))
                console.log(`${fps} FPS, ${dimensions}D, ${animating}`)
            }
            dirty = false
            if (animating) {
                (canvas as any).dirty = true
            }
        }
    }
    let dirty = false
    let start: number | null = null
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
    testPerformance?: number
}) {
    let { dimensions, content, testPerformance, ...rest } = p
    let canvas = c.begin(html.canvas, rest)
        let repaint = ensureRootRepaintableVirtualNode(c, canvas, dimensions = dimensions || 2, testPerformance)
        content(c)
        if (repaint) {
            repaint()
        }
    c.end(html.canvas)
})
