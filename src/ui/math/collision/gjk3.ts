import Vector3 from "../Vector3";

export type SupportFunction = (v: Vector3) => Vector3

function normalOnSide(vector: Vector3, direction: Vector3) {
    return vector.cross(direction).cross(vector)
}

function isAbove(rayOrigin: Vector3, rayHeading: Vector3) {
    return rayOrigin.dot(rayHeading) < 0
}

function checkEdge(egdeA: Vector3, edgeB: Vector3) {
    let heading = edgeB.subtract(egdeA)
    return isAbove(egdeA, heading)
}

function normalForEdge(edgeA: Vector3, edgeB: Vector3) {
    return normalOnSide(edgeB.subtract(edgeA), edgeA.negate())
}

function checkFace(a: Vector3, b: Vector3, c: Vector3) {
    let ab = b.subtract(a)
    let ac = c.subtract(a)
    let abNormal = normalOnSide(ab, ac)
    let acNormal = normalOnSide(ac, ab)
    return isAbove(a, abNormal) && isAbove(a, acNormal)
}

function checkFace3D(a: Vector3, b: Vector3, c: Vector3, inPoint: Vector3) {
    return checkFace(a, b, c) && normalForFace(a, b, c).dot(inPoint) > 0
}

function normalForFace(a: Vector3, b: Vector3, c: Vector3) {
    let ab = b.subtract(a)
    let ac = c.subtract(a)
    let normal = ab.cross(ac)
    return normal.dot(a) > 0 ?
        normal.negate() :
        normal
}

function checkVolume(a: Vector3, b: Vector3, c: Vector3, d: Vector3) {
    return normalForFace(a, b, c).dot(d) > 0 &&
        normalForFace(a, b, d).dot(c) > 0 &&
        normalForFace(a, c, d).dot(b) > 0
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
                } else if (checkEdge(a, b)) {
                    searchDirection = normalForEdge(a, b)
                    simplex = [b, a]
                } else if (checkEdge(a, c)) {
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
                if (checkVolume(a, b, c, d))
                    return true

                let faces = [
                    [a, b, c, d],
                    [a, b, d, c],
                    [a, c, d, b],
                ]

                for (let face of faces) {
                    let [v0, v1, v2, inPoint] = face
                    if (checkFace3D(v0, v1, v2, inPoint)) {
                        searchDirection = normalForFace(v0, v1, v2)
                        simplex = face
                        return false
                    }
                }

                let edges = [
                    [a, b],
                    [a, c],
                    [a, d],
                ]

                for (let edge of edges) {
                    let [v0, v1] = edge
                    if (checkEdge(v0, v1)) {
                        searchDirection = normalForEdge(v0, v1)
                        simplex = edge
                        return false
                    }
                }

                searchDirection = a.negate()
                simplex = [a]
                return false
            }
        }
    }

    let i = 0
    while (true) {
        if (++i > maxIterations)
            return false
        if (searchDirection.equivalent(Vector3.zero))
            searchDirection = searchDirection.add(new Vector3(1, 1, 0))
        let nextVertex = support(searchDirection)

        let isVNaN = nextVertex.toArray().map(x => isNaN(x)).reduce((a, b) => a || b)
        if (isVNaN)
            debugger

        if (nextVertex.dot(searchDirection) < 0)
            return false
        simplex.push(nextVertex)
        let intersected = checkAndUpdateSimplex()
        if (intersected)
            return true
    }
}