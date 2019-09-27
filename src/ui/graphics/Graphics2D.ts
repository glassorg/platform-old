import Color from "../math/Color"
import Graphics from "./Graphics"
import Matrix4 from "../math/Matrix4"

export default class Graphics2D extends Graphics {

    readonly context: CanvasRenderingContext2D

    constructor(context: CanvasRenderingContext2D) {
        super()
        this.context = context
    }

    get width() {
        return this.context.canvas.width
    }

    get height() {
        return this.context.canvas.height
    }

    _transform: Matrix4 = Matrix4.identity
    set transform(m: Matrix4) {
        this.context.setTransform(m.m00, m.m01, m.m10, m.m11, m.m30, m.m31)
        this._transform = m
    }

    get transform() {
        return this._transform
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