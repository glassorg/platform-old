import Vector2 from "../Vector2";

export type SupportFunction = (v: Vector2) => Vector2

function normalOnSide(vector: Vector2, direction: Vector2) {
    let crossZ = vector.x * direction.y - vector.y * direction.x
    return crossZ < 0 ?
        new Vector2(vector.y, -vector.x) :
        new Vector2(-vector.y, vector.x)
}

function isOriginAbove(rayOrigin: Vector2, rayHeading: Vector2) {
    return rayOrigin.dot(rayHeading) < 0
}

function checkEdge(egdeA: Vector2, edgeB: Vector2) {
    let heading = edgeB.subtract(egdeA)
    return isOriginAbove(egdeA, heading)
}

function checkEdgeSigned(edgeA: Vector2, edgeB: Vector2, inPoint: Vector2) {
    let heading = edgeB.subtract(edgeA)
    return isOriginAbove(edgeA, heading) && !isOriginAbove(edgeA, normalOnSide(heading, inPoint.subtract(edgeA)))
}

function normalForEdge(edgeA: Vector2, edgeB: Vector2) {
    return normalOnSide(edgeB.subtract(edgeA), edgeA.negate())
}

function checkFace(a: Vector2, b: Vector2, c: Vector2) {
    let ab = b.subtract(a)
    let ac = c.subtract(a)
    let abNormal = normalOnSide(ab, ac)
    let acNormal = normalOnSide(ac, ab)
    return isOriginAbove(a, abNormal) && isOriginAbove(a, acNormal)
}

export default function gjk(support: SupportFunction, debug: any = undefined) {
    const maxIterations = 100
    const initialHeading = new Vector2(1, 0)
    let initialPoint = support(initialHeading)
    let searchDirection = initialPoint.negate()
    let simplex: Vector2[] = [initialPoint]

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
                if (checkFace(a, b, c))
                    return true

                if (checkEdgeSigned(a, b, c)) {
                    searchDirection = normalForEdge(a, b)
                    simplex = [b, a]
                } else if (checkEdgeSigned(a, c, b)) {
                    searchDirection = normalForEdge(a, c)
                    simplex = [c, a]
                } else {
                    searchDirection = a.negate()
                    simplex = [a]
                }

                return false
            }
        }
    }

    let i = 0
    while (true) {
        if (++i > maxIterations)
            return false
        let nextVertex = support(searchDirection)
        if (nextVertex.dot(searchDirection) < 0)
            return false
        simplex.push(nextVertex)
        let intersected = checkAndUpdateSimplex()
        if (intersected)
            return true
    }
}