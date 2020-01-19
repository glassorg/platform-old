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

    computeNormals() {
        if (this.primitive !== Primitive.triangles) {
            throw new Error("Can only generate normals on triangles")
        }

        const faceNormals: Vector3[] = new Array(this.indexes.length / 3)
        const vertexFaces: number[][] = []
        for (let i = 0; i < this.vertices.length; i++) {
            vertexFaces[i] = []
        }
        for (let fi = 0; fi < this.indexes.length; fi += 3) {
            const ai = this.indexes.get(fi + 0)
            const bi = this.indexes.get(fi + 1)
            const ci = this.indexes.get(fi + 2)
            vertexFaces[ai].push(fi)
            vertexFaces[bi].push(fi)
            vertexFaces[ci].push(fi)
            faceNormals[fi] = getFaceNormal(
                this.vertices.get3(ai, "position"),
                this.vertices.get3(bi, "position"),
                this.vertices.get3(ci, "position"),
            )
        }

        for (let vi = 0; vi < this.vertices.length; vi++) {
            // for every vertex, finds faces that contains it and
            let normals = vertexFaces[vi].map(fi => faceNormals[fi])
            // now set the normal on that vertex
            let normal = Vector3.add(normals).normalize()
            this.vertices.set3(vi, "normal", normal)
        }
        return this
    }

}
