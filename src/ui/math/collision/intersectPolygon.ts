import Vector3 from "../Vector3"
import { clamp } from ".."

function getPlaneNormal(polyA: Vector3[], polyB: Vector3[]) {
    let firstThreeVertices: Vector3[] = []
    for (let poly of [polyA, polyB]) {
        for (let v of poly) {
            if (firstThreeVertices.length == 3) break
            firstThreeVertices.push(v)
        }
    }

    let [a, b, c] = firstThreeVertices
    let ab = b.subtract(a)
    let ac = c.subtract(a)

    let planeNormal = ab.cross(ac)
    return planeNormal
}

function intersection(a0: Vector3, a1: Vector3, b0: Vector3, b1: Vector3, planeNormal: Vector3) {
    let ah = a1.subtract(a0)
    let bh = b1.subtract(b0)
    let n = bh.cross(planeNormal)
    let diff = b0.subtract(a0)
    let t = diff.dot(n) / ah.dot(n)
    if (!Number.isFinite(t))
        return null
    let point = a0.add(ah.scale(t))
    if (!lineContainsPoint(a0, a1, point) || !lineContainsPoint(b0, b1, point))
        return null
    return a0.add(ah.scale(t))
}

function distanceSquaredFromLine(a: Vector3, b: Vector3, p: Vector3) {
    let ap = p.subtract(a)
    let ab = b.subtract(a)
    let h = clamp(ap.dot(ab) / ab.lengthSquared(), 0, 1)
    return ap.subtract(ab.scale(h)).lengthSquared()
}

const epsilon = 0.001
function lineContainsPoint(a: Vector3, b: Vector3, p: Vector3) {
    return distanceSquaredFromLine(a, b, p) < epsilon
}

function getCyc(arr, index) { return arr[index % arr.length] }

// This is O(n^2), but we expect a max of 16 vertices. We should still find an more efficient solution.
// This is not a completely general intersction algorithm, it assumes that the polygons are convex, coplanar, and overlapping.
// This is only intended for contact manifold generation where these conditions are guaranteed.
export default function intersectPolygon(polyA: Vector3[], polyB: Vector3[]) {
    if (polyA.length == 1)
        return polyA
    if (polyB.length == 1)
        return polyB

    let planeNormal = getPlaneNormal(polyA, polyB)

    function containsPoint(poly: Vector3[], point: Vector3) {
        if (poly.length == 2)
            return lineContainsPoint(poly[0], poly[1], point)
        let chirality = 0
        for (let i = 0; i < poly.length; i++) {
            let [a, b] = [poly[i], getCyc(poly, i + 1)]
            let ab = b.subtract(a)
            let ap = point.subtract(a)
            let curChirality = Math.sign(ab.cross(ap).dot(planeNormal))
            if (curChirality == 0) continue
            chirality = chirality || curChirality
            if (chirality != curChirality && !lineContainsPoint(a, b, point)) return false
        }
        return true
    }

    // Because the polygons are convex, this returns a max of 2 intersections.
    function allIntersections() {
        let result: Vector3[] = []
        let polyAEdgeCount = polyA.length == 2 ? 1 : polyA.length
        let polyBEdgeCount = polyB.length == 2 ? 1 : polyB.length
        for (let i = 0; i < polyAEdgeCount; i++) {
            for (let j = 0; j < polyBEdgeCount; j++) {
                let v = intersection(
                    polyA[i], getCyc(polyA, i + 1),
                    polyB[j], getCyc(polyB, j + 1),
                    planeNormal
                )
                if (v) result.push(v)
            }
        }
        return result
    }

    let vertices = allIntersections()
    for (let poly of [polyA, polyB])
        for (let v of poly)
            if (containsPoint(polyA, v) && containsPoint(polyB, v))
                vertices.push(v)
    return vertices
}

// export function sweepIntersectPolygon(polyA: Vector3[], polyB: Vector3[]) {
//     let planeNormal = getPlaneNormal(polyA, polyB)
//     let sweepAxis = polyA[1].subtract(polyA[0])

//     let sortEdges = (poly: Vector3[], edges: number[]) => edges.sort((i, j) => poly[i].dot(sweepAxis) - poly[j].dot(sweepAxis))
//     function upperAndLowerEdges(poly: Vector3[]) {
//         let upper: number[] = []
//         let lower: number[] = []
//         for (let i = 0; i < poly.length; i++) {
//             let [a, b] = [poly[i], getCyc(poly, i + 1)]
//             let ab = b.subtract(a)
//             if (ab.dot(sweepAxis) > 0)
//                 upper.push(i)
//             else
//                 lower.push(i)
//         }
//         sortEdges(poly, upper)
//         sortEdges(poly, lower)
//         return { upper, lower }
//     }

//     let edgesA = upperAndLowerEdges(polyA)
//     let edgesB = upperAndLowerEdges(polyB)

//     let sweepDistance = 0

//     function sweeper(poly: Vector3[], edges: number[]) {
//         let i = 0
//         function advance() {
//             while (true) {
//                 let edgeEnd = getCyc(poly, i + 1)
//                 if (edgeEnd.dot(sweepAxis) < sweepDistance)
//                     i += 1
//             }
//         }
//         function getEdge() {

//         }
//     }
// }