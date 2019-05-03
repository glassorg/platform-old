import Color from "../math/Color";
import Graphics from "./Graphics";

export default class Graphics2D extends Graphics {

    readonly context: CanvasRenderingContext2D

    constructor(context: CanvasRenderingContext2D) {
        super()
        this.context = context
    }

    clear(color: Color = Color.transparent, depth: number = 1) {
        let { width, height } = window.screen
        this.context.clearRect(0, 0, width, height)
        if (color.alpha > 0) {
            this.context.fillStyle = color.toString()
            this.context.fillRect(0, 0, width, height)
            this.context.fill()
        }
    }

    begin() {
        this.context.resetTransform()
    }

    end() {
    }

    fillRectangle(x: number, y: number, width: number, height: number, color: Color) {
        this.context.fillStyle = color.toString()
        this.context.fillRect(x, y, width, height)
    }

}