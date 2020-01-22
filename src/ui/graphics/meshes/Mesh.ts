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

function getVertexCacheKey(position: Vector3): any {
    return position.toString()    
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

    // TODO: share vertices by position cache
    subdivideFace(faceIndex: number, keyFunction?: ((position: Vector3) => any), cache?: Map<any,number>) {
        const faceVertexIndex0 = faceIndex * 3

        const getInterpolatedVertex = (a: number, b: number) => {
            if (keyFunction && cache) {
                const position = this.vertices.get(a, "position", Vector3).lerp(this.vertices.get(b, "position", Vector3), 0.5)
                const key = keyFunction(position)
                const cached = cache.get(key)
                if (cached != null) {
                    return cached
                }
                else {
                   const newVertexIndex = this.vertices.addInterpolatedVertex(a, b)
                   cache.set(key, newVertexIndex)
                   return newVertexIndex 
                }
            }
            // return this.indexes.get(faceVertexIndex0)
            return this.vertices.addInterpolatedVertex(a, b)
        }

        const a = this.indexes.get(faceVertexIndex0 + 0)
        const b = this.indexes.get(faceVertexIndex0 + 1)
        const c = this.indexes.get(faceVertexIndex0 + 2)
        //  create 3 new interpolated vertices
        const ab = getInterpolatedVertex(a, b)
        const bc = getInterpolatedVertex(b, c)
        const ca = getInterpolatedVertex(c, a)
        // first change old vertex to now be face a -> ab -> ca
        this.indexes.set(faceVertexIndex0 + 1, ab)
        this.indexes.set(faceVertexIndex0 + 2, ca)
        // now add three new faces
        //       A
        //     /   \
        //   CA --- AB
        //  /  \   /  \
        // C --- BC --- B
        this.indexes.push(
            ab, b, bc,
            ca, bc, c,
            ca, ab, bc,
        )
    }

    subdivideAllFaces(recurse = 0, keyFunction: (position: Vector3) => any = getVertexCacheKey) {
        let cache = new Map()
        for (let count = 0; count <= recurse; count++) {
            const faceCount = this.indexes.length / 3
            for (let face = faceCount - 1; face >= 0; face--) {
                this.subdivideFace(face, keyFunction, cache)
            }
        }
        return this
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
        for (let faceVertexIndex0 = 0; faceVertexIndex0 < this.indexes.length; faceVertexIndex0 += 3) {
            const ai = this.indexes.get(faceVertexIndex0 + 0)
            const bi = this.indexes.get(faceVertexIndex0 + 1)
            const ci = this.indexes.get(faceVertexIndex0 + 2)
            vertexFaces[ai].push(faceVertexIndex0)
            vertexFaces[bi].push(faceVertexIndex0)
            vertexFaces[ci].push(faceVertexIndex0)
            faceNormals[faceVertexIndex0] = getFaceNormal(
                this.vertices.get(ai, "position"),
                this.vertices.get(bi, "position"),
                this.vertices.get(ci, "position"),
            )
        }

        for (let vi = 0; vi < this.vertices.length; vi++) {
            // for every vertex, get the surrounding faces normals
            let normals = vertexFaces[vi].map(fi => faceNormals[fi])
            // now set the normal on that vertex
            let normal = Vector3.add(normals).normalize()
            this.vertices.set(vi, "normal", normal)
        }
        return this
    }

}
