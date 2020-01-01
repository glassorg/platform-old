import Color from "../math/Color"
import Matrix4 from "../math/Matrix4"
import ResourceManager from "./resources/ResourceManager"
import ResourceLoader from "./resources/ResourceLoader"
import Node from "./scene/Node"

export default abstract class Graphics {

    // resources
    public readonly resources: ResourceManager
    // timing
    time = 0
    // properties
    abstract get width(): number
    abstract get height(): number
    // render lifecycle
    abstract begin()
    abstract end()
    // transformation
    abstract uniforms: { modelView: Matrix4, projection: Matrix4 }
    // abstract get transform(): Matrix4
    // abstract set transform(value: Matrix4)
    // drawing
    abstract clear(color?: Color, depth?: number)
    drawImage(image, x: number, y: number, width: number, height: number) {
        this.fillRectangle(x, y, width, height, Color.white, image)
    }
    abstract fillRectangle(x: number, y: number, width: number, height: number, color: Color, texture?)
    // request redraw
    abstract invalidate()

    /**
     * Shorthand for Graphics.resources.getResource(loader, id)
     */
    resource<T>(loader: ResourceLoader, id: string, node?: Node) {
        return this.resources.getResource(loader, id, node)
    }

    constructor() {
        this.resources = new ResourceManager(this)
    }

}