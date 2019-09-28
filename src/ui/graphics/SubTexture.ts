import { createTexture } from "./functions"
import TextureBase from "./TextureBase"
import Texture from "./Texture"
import Rectangle from "../math/Rectangle"

export default class SubTexture extends TextureBase {

    private texture: Texture
    private bounds: Rectangle

    constructor(texture: Texture, bounds: Rectangle) {
        super()
        this.texture = texture
        this.bounds = bounds
    }

    get glTexture() {
        return this.texture.glTexture
    }

    /**
     * Gets the left UV coordinate.
     */
    get left() { return this.bounds.left / this.texture.width }
    /**
     * Gets the top UV coordinate.
     */
    get top() { return this.bounds.top / this.texture.height }
    /**
     * Gets the right UV coordinate.
     */
    get right() { return this.bounds.right / this.texture.width }
    /**
     * Gets the bottom UV coordinate.
     */
    get bottom() { return this.bounds.bottom / this.texture.height }

}