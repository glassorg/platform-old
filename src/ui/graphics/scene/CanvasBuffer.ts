import Control from "./Control"
import Texture from "../Texture"
import Matrix4 from "../../math/Matrix4"
import Graphics from "../Graphics"
import Graphics2D from "../Graphics2D"
import Graphics3D from "../Graphics3D"
import Color from "../../math/Color"

let nextId = 0
function getNextId() {
    return `CanvasBuffer_${nextId++}`
}

export default class CanvasBuffer extends Control {

    canvas: HTMLCanvasElement = document.createElement("canvas")
    texture?: Texture
    id: string = getNextId()

    constructor() {
        super()
        this.width = 100
        this.height = 100
    }

    calculateWorldTransform(parentTransform, localTransform) {
        return Matrix4.identity
    }

    draw(g: Graphics) {
        let resize = this.canvas.width !== this.width || this.canvas.height !== this.height
        if (resize) {
            this.canvas.width = this.width
            this.canvas.height = this.height
        }
        // re-rendering needs to be friggin asynchronous!
        if (this.dirty || resize) {
            let context = this.canvas.getContext("2d") as CanvasRenderingContext2D
            let subG = new Graphics2D(context)
            //  draw kids on the canvas
            super.draw(subG)

            if (g instanceof Graphics3D) {
                let dataUrl = this.canvas.toDataURL()
                if (this.texture == null) {
                    this.texture = g.createTexture(this.id, dataUrl)
                }
                else {
                    this.texture.update(dataUrl, (image) => {
                        //  the image being ready may be asynchronous
                        //  so we will have to invalidate canvas and wait for repaint.
                        g.invalidate()
                    })
                }
            }
        }

        if (g instanceof Graphics2D) {
            //  draw the canvas on our current context
            g.context.drawImage(this.canvas, this.x, this.y)
        }
        else if (g instanceof Graphics3D) {
            g.fillRectangle(this.x, this.y, this.canvas.width, this.canvas.height, Color.white, this.texture)
        }
    }

}