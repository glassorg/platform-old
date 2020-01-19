import VertexArray from "../VertexArray"
import IndexArray from "../IndexArray"
import VertexFormat from "../VertexFormat"
import IndexBuffer from "../IndexBuffer"
import Graphics3D from "../Graphics3D"
import Primitive from "../Primitive"
import { BufferUsage } from "../DataBuffer"
import VertexBuffer from "../VertexBuffer"
import Vector3 from "../../math/Vector3"

export function getFaceNormal(a: Vector3, b: Vector3, c: Vector3) {
    return a.subtract(b).cross(a.subtract(c))
}

export default class Mesh {

    readonly vertices: VertexArray
    readonly indexes: IndexArray
    readonly primitive: Primitive

    constructor(vertices: VertexArray | VertexFormat, indexes: IndexArray = new IndexArray(), primitive = Primitive.triangles) {
        this.vertices = vertices instanceof VertexArray ? vertices : new VertexArray(vertices)
        this.indexes = indexes
        this.primitive = primitive
    }

    createIndexBuffer(g: Graphics3D, usage = BufferUsage.staticDraw) {
        const ib = new IndexBuffer(g, usage, this.vertices.format,
            this.primitive, undefined, this.indexes.type)
        return this.writeTo(ib)
    }

    writeTo(ib: IndexBuffer) {
        ib.vertices[0].setData(this.vertices.floatData)
        ib.setData(this.indexes.data)
        return ib
    }

    generateNormals() {
        if (this.primitive !== Primitive.triangles) {
            throw new Error("Can only generate normals on triangles")
        }

        for (let vi = 0; vi < this.vertices.length; vi++) {
            // for every vertex, finds faces that contains it and
            let normals: Vector3[] = []
            // check every face.
            for (let i = 0; i < this.indexes.length; i++) {
                let index = this.indexes.get(i)
                if (index === vi) {
                    let fi = Math.floor(i / 3) * 3 // faceIndex
                    normals.push(getFaceNormal(
                        this.vertices.get3(this.indexes.get(fi + 0), "position"),
                        this.vertices.get3(this.indexes.get(fi + 1), "position"),
                        this.vertices.get3(this.indexes.get(fi + 2), "position"),
                    ))
                }
            }
            // now set the normal on that vertex
            let normal = Vector3.add(normals).normalize()
            this.vertices.set3(vi, "normal", normal)
        }
        return this
    }

}
