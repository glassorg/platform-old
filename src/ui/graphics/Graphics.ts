import Color from "../math/Color"
import Matrix4 from "../math/Matrix4"

export default abstract class Graphics {

    // properties
    abstract get width()
    abstract get height()
    // render lifecycle
    abstract begin()
    abstract end()
    // transformation
    abstract translate(dx: number, dy: number, dz?: number)
    abstract rotate(angle: number)
    abstract scale(sx: number, sy?: number, sz?: number)
    abstract transform(matrix: Matrix4)
    // drawing
    abstract clear(color?: Color, depth?: number)
    abstract fillRectangle(x: number, y: number, width: number, height: number, color: Color)

}