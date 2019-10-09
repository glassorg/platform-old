import Color from "../math/Color"
import Graphics from "./Graphics"
import Matrix4 from "../math/Matrix4"
import { memoize } from "../../utility/common"

class Uniforms {

    readonly context: CanvasRenderingContext2D
    constructor(context: CanvasRenderingContext2D) {
        this.context = context
    }

    private _modelView: Matrix4 = Matrix4.identity

    get modelView() {
        return this._modelView
    }
    set modelView(value) {
        this.context.setTransform(value.m00, value.m01, value.m10, value.m11, value.m30, value.m31)
        this._modelView = value
    }
    get projection() {
        return Matrix4.identity
    }
    set projection(value) {
    }

}

export default class Graphics2D extends Graphics {

    readonly context: CanvasRenderingContext2D

    _uniforms: Uniforms

    constructor(context: CanvasRenderingContext2D) {
        super()
        this.context = context

        let _modelView = Matrix4.identity
        this._uniforms = new Uniforms(context)
        this.getImage = memoize((name: string) => {
            let image = new Image()
            image.onload = (e) => { this.invalidate() }
            image.src = name
            return image
        }) as any
    }

    getImage = (name: string) => HTMLImageElement

    get uniforms() {
        return this._uniforms
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

    invalidate() {
        let canvas = this.context.canvas as any
        canvas.dirty = true
    }

    fillRectangle(x: number, y: number, width: number, height: number, color: Color, texture) {
        if (typeof texture === "string") {
            texture = this.getImage(texture)
        }

        if (texture) {
            this.context.drawImage(texture, x, y, width, height)
        }
        else {
            this.context.fillStyle = color.toString()
            this.context.fillRect(x, y, width, height)
        }
    }

}