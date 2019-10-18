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
import State from "../../data/State"
import Store from "../../data/Store"
import Key from "../../data/Key"

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
    function repaint() {
        rafId = null
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
            frame++
            if (start == null) {
                start = time
            }
            graphics.time = (time - start) / 1000
            // layout any children using the Dock layout.
            let animating = false
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
            dirty = false
            if (animating) {
                (canvas as any).dirty = true
            }

            // update fps state
            let checkFPSFrames = 100
            if (frame % checkFPSFrames == 0 && canvas.id.length > 0) {
                let seconds = (time - (frameStart || start)) / 1000
                frameStart = time
                let fps = Math.round(checkFPSFrames / seconds)
                Store.default.patch(Key.create(CanvasState, canvas.id), { fps })
            }
        }
    }
    let dirty = false
    let start: number | null = null
    let frame = 0
    let frameStart: number | null = null
    let rafId: number | null = null
    Object.defineProperties(extendElementAsVirtualNodeRoot(canvas), {
        dirty: {
            get() { return dirty },
            set(value: boolean) {
                if (value !== dirty) {
                    dirty = value
                    if (value && rafId == null) {
                        //  was using c.requestAnimationFrame
                        //  wasn't firing the first time on rendering repaint
                        rafId = requestAnimationFrame(repaint)
                    }
                }
            }
        }
    })
    return repaint
}

@State.class()
export class CanvasState extends State {

    @State.property({ type: "integer", default: 0 })
    fps!: number

}

export const FPS = Context.component(function FPS(c: Context, p: { id: string }) {
    let state = c.store.get(Key.create(CanvasState, p.id))
    html.div({
        style: `
            position: absolute;
            top: 10px;
            left: 10px;
            color: green;
            z-index: 1;
            font-size: 18px;
        `,
        content: `${state.fps} FPS`
    })
})

export default Context.component(function Canvas(c: Context, p: {
    id?: string,
    dimensions?: 2 | 3,
    content: (c: Context) => void,
    width?: number,
    height?: number,
    class?: string,
    style?: string
}) {
    let { dimensions, content, ...rest } = p
    let canvas: any = c.begin(html.canvas, rest)
        let repaint = ensureRootRepaintableVirtualNode(c, canvas, dimensions = dimensions || 2)
        content(c)
        canvas.dirty = true
    c.end(html.canvas)
})
