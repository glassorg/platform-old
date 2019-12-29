import Vector3 from "../Vector3";

export type SupportFunction = (v: Vector3) => Vector3

function normalOnSide(vector: Vector3, direction: Vector3) {
    return vector.cross(direction).cross(vector)
}

function faceNormalOnSide(a: Vector3, b: Vector3, c: Vector3, abovePoint: Vector3) {
    let ab = b.subtract(a)
    let ac = c.subtract(a)
    let normal = ab.cross(ac)
    return normal.dot(abovePoint.subtract(a)) < 0 ?
        normal.negate() :
        normal
}

function isOriginAbove(rayOrigin: Vector3, rayHeading: Vector3) {
    return rayOrigin.dot(rayHeading) < 0
}

function checkEdge(a: Vector3, b: Vector3) {
    let heading = b.subtract(a)
    return isOriginAbove(a, heading)
}

function checkTriangleEdge(a: Vector3, b: Vector3, inPoint: Vector3) {
    let heading = b.subtract(a)
    return isOriginAbove(a, heading) && !isOriginAbove(a, normalOnSide(heading, inPoint.subtract(a)))
}

function normalForEdge(a: Vector3, b: Vector3) {
    return normalOnSide(b.subtract(a), a.negate())
}

function checkFace(a: Vector3, b: Vector3, c: Vector3) {
    let ab = b.subtract(a)
    let ac = c.subtract(a)
    let abNormal = normalOnSide(ab, ac)
    let acNormal = normalOnSide(ac, ab)
    return isOriginAbove(a, abNormal) && isOriginAbove(a, acNormal)
}

function normalForFace(a: Vector3, b: Vector3, c: Vector3) {
    let ab = b.subtract(a)
    let ac = c.subtract(a)
    let normal = ab.cross(ac)
    return normal.dot(a) > 0 ?
        normal.negate() :
        normal
}

function checkTetrahedron(a: Vector3, b: Vector3, c: Vector3, d: Vector3) {
    return isOriginAbove(a, faceNormalOnSide(a, b, c, d)) &&
        isOriginAbove(a, faceNormalOnSide(a, b, d, c)) &&
        isOriginAbove(a, faceNormalOnSide(a, c, d, b))
}

function checkTetrahedralVertex(a: Vector3, b: Vector3, c: Vector3, d: Vector3) {
    return !checkEdge(a, b) &&
        !checkEdge(a, c) &&
        !checkEdge(a, d)
}

function checkTetrahedralEdge(a: Vector3, b: Vector3, c: Vector3, d: Vector3) {
    let ab = b.subtract(a)
    let ac = c.subtract(a)
    let ad = d.subtract(a)
    let acNormal = normalOnSide(ab, ac)
    let adNormal = normalOnSide(ab, ad)
    return checkEdge(a, b) &&
        !isOriginAbove(a, acNormal) &&
        !isOriginAbove(a, adNormal)
}

function checkTetrahedralFace(a: Vector3, b: Vector3, c: Vector3, inPoint: Vector3) {
    return checkFace(a, b, c) && !isOriginAbove(a, faceNormalOnSide(a, b, c, inPoint))
}

export default function gjk(support: SupportFunction, debug: any = undefined) {
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
        if (searchDirection.equivalent(Vector3.zero)) {
            // searchDirection = new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
            searchDirection = searchDirection.add(new Vector3(1, 1, 0))
        }
        let nextVertex = support(searchDirection)

        // let isVNaN = nextVertex.toArray().map(x => isNaN(x)).reduce((a, b) => a || b)
        // if (isVNaN)
        //     debugger

        if (nextVertex.dot(searchDirection) < 0)
            return false
        simplex.push(nextVertex)
        let intersected = checkAndUpdateSimplex()
        if (intersected)
            return true
    }
}