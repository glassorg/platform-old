import * as GL from "./GL"

//  we can promote this enum later to smart objects which help draw the right amount
enum Primitive {
    triangles = GL.TRIANGLES,
    points = GL.POINTS,
    lines = GL.LINES
}

export default Primitive

