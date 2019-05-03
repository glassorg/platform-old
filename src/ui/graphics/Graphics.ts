import Color from "../math/Color";

export default abstract class Graphics {

    abstract clear(color?: Color, depth?: number)
    abstract begin()
    abstract end()
    abstract fillRectangle(x: number, y: number, width: number, height: number, color: Color)

}