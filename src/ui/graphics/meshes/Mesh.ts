import VertexArray from "../VertexArray"
import IndexArray from "../IndexArray"
import VertexFormat from "../VertexFormat"

export default class Mesh {

    vertices: VertexArray
    faces: IndexArray

    constructor(vertices: VertexArray | VertexFormat, faces: IndexArray = new IndexArray()) {
        this.vertices = vertices instanceof VertexArray ? vertices : new VertexArray(vertices)
        this.faces = faces
    }

}