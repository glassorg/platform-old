import Vector3 from "../Vector3";
import Matrix4 from "../Matrix4";
import { SupportFunction, nonMultiple, checkEdge, normalForEdge, checkFace, checkTriangleEdge, normalForFace, raycastTriangle } from "./gjkCommon";


export function gjkRaycastInitialTriangle(support: SupportFunction, heading: Vector3, debug?: any) {
    function project(vector: Vector3) { return heading.rejection(vector) }
    const maxIterations = 100
    const initialHeading = nonMultiple(heading).cross(heading)
    let initialPoint = support(initialHeading)
    let searchDirection = project(initialPoint.negate())
    let simplex: Vector3[] = [initialPoint]


    if (debug)
        debug.simplices = []

    function checkAndUpdateSimplex() {
        if (debug)
            debug.simplices.push(simplex.slice())

        switch (simplex.length) {

            case 1: {
                searchDirection = project(simplex[0].negate())
                return false
            }

            case 2: {
                let [b, a] = simplex
                let pb = project(b)
                let pa = project(a)
                if (checkEdge(pa, pb)) {
                    searchDirection = normalForEdge(pa, pb)
                } else {
                    searchDirection = pa.negate()
                    simplex = [a]
                }
                return false
            }

            case 3: {
                let [c, b, a] = simplex
                let pc = project(c)
                let pb = project(b)
                let pa = project(a)
                if (checkFace(pa, pb, pc)) {
                    return true
                } else if (checkTriangleEdge(pa, pb, pc)) {
                    searchDirection = normalForEdge(pa, pb)
                    simplex = [b, a]
                } else if (checkTriangleEdge(pa, pc, pb)) {
                    searchDirection = normalForEdge(pa, pc)
                    simplex = [c, a]
                } else {
                    searchDirection = pa.negate()
                    simplex = [a]
                }
                return false
            }
        }
    }

    let i = 0
    while (true) {
        if (++i > maxIterations)
            return null
        if (searchDirection.equivalent(Vector3.zero))
            searchDirection = project(searchDirection.add(new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)))
        let nextVertex = support(searchDirection)
        if (nextVertex.dot(searchDirection) < 0)
            return null
        simplex.push(nextVertex)
        let intersected = checkAndUpdateSimplex()
        if (intersected)
            return simplex
    }
}

export default function gjkRaycast3(support: SupportFunction, heading: Vector3, debug?: any) {
    function project(vector: Vector3) { return heading.rejection(vector) }
    const maxIterations = 100
    let simplex = gjkRaycastInitialTriangle(support, heading, debug)
    if (!simplex)
        return null
    let i = 0
    while (true) {
        let [a, b, c] = simplex as Vector3[]
        let normal = normalForFace(a, b, c)
        let d = support(normal)
        if (++i > maxIterations || d.equivalent(a) || d.equivalent(b) || d.equivalent(c))
            return simplex
        let faces = [
            [d, b, c],
            [a, d, c],
            [a, b, d],
        ]
        for (let face of faces) {
            let [a, b, c] = face
            try {
                if (raycastTriangle(Vector3.zero, heading, a, b, c) !== null)
                    simplex = face
            } catch (e) {
                return simplex
            }
        }
    }
}