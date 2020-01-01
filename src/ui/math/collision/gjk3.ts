import Vector3 from "../Vector3";
import { SupportFunction, checkEdge, normalForEdge, checkFace, normalForFace, checkTriangleEdge, checkTetrahedron, checkTetrahedralFace, checkTetrahedralVertex, checkTetrahedralEdge } from "./gjkCommon";

export default function gjk3(support: SupportFunction, debug: any = undefined) {
    const maxIterations = 100
    const initialHeading = new Vector3(1, 0, 0)
    let initialPoint = support(initialHeading)
    let searchDirection = initialPoint.negate()
    let simplex: Vector3[] = [initialPoint]

    if (debug)
        debug.simplices = []

    function checkAndUpdateSimplex() {
        if (debug)
            debug.simplices.push(simplex.slice())

        switch (simplex.length) {

            case 1: {
                searchDirection = simplex[0].negate()
                return false
            }

            case 2: {
                let [b, a] = simplex
                if (checkEdge(a, b)) {
                    searchDirection = normalForEdge(a, b)
                } else {
                    searchDirection = a.negate()
                    simplex = [a]
                }
                return false
            }

            case 3: {
                let [c, b, a] = simplex
                if (checkFace(a, b, c)) {
                    searchDirection = normalForFace(a, b, c)
                } else if (checkTriangleEdge(a, b, c)) {
                    searchDirection = normalForEdge(a, b)
                    simplex = [b, a]
                } else if (checkTriangleEdge(a, c, b)) {
                    searchDirection = normalForEdge(a, c)
                    simplex = [c, a]
                } else {
                    searchDirection = a.negate()
                    simplex = [a]
                }
                return false
            }

            case 4: {
                let [d, c, b, a] = simplex
                if (checkTetrahedron(a, b, c, d))
                    return true

                let faces = [
                    [a, b, c, d],
                    [a, b, d, c],
                    [a, c, d, b],
                ]

                for (let face of faces) {
                    let [a, b, c, d] = face
                    if (checkTetrahedralFace(a, b, c, d)) {
                        searchDirection = normalForFace(a, b, c)
                        simplex = [a, b, c]
                        return false
                    }
                }

                if (checkTetrahedralVertex(a, b, c, d)) {
                    searchDirection = a.negate()
                    simplex = [a]
                    return false
                }

                let edges = [
                    [a, b, c, d],
                    [a, c, b, d],
                    [a, d, b, c],
                ]

                for (let edge of edges) {
                    let [a, b, c, d] = edge
                    if (checkTetrahedralEdge(a, b, c, d)) {
                        searchDirection = normalForEdge(a, b)
                        simplex = [a, b]
                        return false
                    }
                }
            }
        }
    }

    let i = 0
    while (true) {
        if (++i > maxIterations)
            return false
        if (searchDirection.equivalent(Vector3.zero))
            searchDirection = new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
        let nextVertex = support(searchDirection)
        if (nextVertex.dot(searchDirection) < 0)
            return false
        simplex.push(nextVertex)
        let intersected = checkAndUpdateSimplex()
        if (intersected)
            return true
    }
}