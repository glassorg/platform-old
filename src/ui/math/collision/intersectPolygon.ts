import Vector3 from "../Vector3"

// export function sweepIntersectPolygon(polyA: Vector3[], polyB: Vector3[]) {

//     let firstThreeVertices: Vector3[] = []
//     for (let v of polyA) {
//         if (firstThreeVertices.length == 3) break
//         firstThreeVertices.push(v)
//     }
//     for (let v of polyB) {
//         if (firstThreeVertices.length == 3) break
//         firstThreeVertices.push(v)
//     }

//     let planeNormal = (() => {
//         let [a, b, c] = firstThreeVertices
//         let ab = b.subtract(a)
//         let ac = c.subtract(a)
//         return ab.cross(ac)
//     })()

//     type Edge = { a: Vector3, b: Vector3 }

//     function edges(poly: Vector3[]) {
//         let result: 
//     }

// }

// This is O(n^2), but we expect a max of 16 vertices. We should still find an more efficient solution.
export default function intersectPolygon(polyA: Vector3[], polyB: Vector3[]) {

    let firstThreeVertices: Vector3[] = []
    for (let v of polyA) {
        if (firstThreeVertices.length == 3) break
        firstThreeVertices.push(v)
    }
    for (let v of polyB) {
        if (firstThreeVertices.length == 3) break
        firstThreeVertices.push(v)
    }

    let planeNormal = (() => {
        let [a, b, c] = firstThreeVertices
        let ab = b.subtract(a)
        let ac = c.subtract(a)
        return ab.cross(ac)
    })()

    let epsilon = 0.001
    function supplement(poly) {
        let [a, b, c] = firstThreeVertices
        if (poly.length < 3)
            poly.push(poly[0].add(b.subtract(a).normalize().scale(epsilon)))
        if (poly.length < 3)
            poly.push(poly[0].add(c.subtract(a).normalize().scale(epsilon)))
    }

    supplement(polyA)
    supplement(polyB)

    function intersection(a0: Vector3, a1: Vector3, b0: Vector3, b1: Vector3) {
        let ah = a1.subtract(a0)
        let bh = b1.subtract(b0)
        let n = bh.cross(planeNormal)
        let diff = b0.subtract(a0)
        let t = diff.dot(n) / ah.dot(n)
        if (!Number.isFinite(t))
            return null
        return a0.add(ah.scale(t))
    }

    function allIntersections() {
        let result: Vector3[] = []
        for (let i = 0; i < polyA.length; i++) {
            for (let j = 0; j < polyB.length; j++) {
                let v = intersection(
                    polyA[i], polyA[(i + 1) % polyA.length],
                    polyB[j], polyB[(j + 1) % polyB.length]
                )
                if (v) result.push(v)
            }
        }
        return result
    }

    function containsPoint(poly: Vector3[], point: Vector3) {
        let chirality = 0
        for (let i = 0; i < poly.length; i++) {
            let [a, b] = [
                poly[i],
                poly[(i + 1) % poly.length]
            ]
            let ab = b.subtract(a)
            let ap = point.subtract(a)
            let cross = ab.cross(ap).dot(planeNormal)
            let curChirality = Math.sign(cross)
            if (curChirality == 0) continue
            chirality = chirality || curChirality
            if (chirality != curChirality) return false
        }
        return true
    }

    let vertices = allIntersections()
    for (let v of polyA)
        vertices.push(v)
    for (let v of polyB)
        vertices.push(v)

    return vertices.filter(v => containsPoint(polyA, v) && containsPoint(polyB, v))
}
