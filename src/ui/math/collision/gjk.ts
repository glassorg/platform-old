import Vector2 from "../Vector2";

export type SupportFunction = (v: Vector2) => Vector2

function normalOnSide(vector: Vector2, direction: Vector2) {
    let crossZ = vector.x * direction.y - vector.y * direction.x
    return crossZ > 0 ?
        new Vector2(vector.y, -vector.x) :
        new Vector2(-vector.y, vector.x)
}

const RIGHT = new Vector2(1, 0)
export default function gjk(support: SupportFunction, maxIterations: 100, initialHeading = RIGHT) {
    let initialPoint = support(initialHeading)
    let heading = initialPoint.negate()
    let simplex: Vector2[] = [initialPoint]

    function checkAndUpdateSimplex() {
        switch (simplex.length) {

            case 1: {
                heading = simplex[0].negate()
                return false
            }

            case 2: {
                let [b, a] = simplex
                let ab = b.subtract(a)
                let ao = a.negate()
                if (ab.dot(ao) < 0) {
                    heading = ao
                    simplex = [a]
                    return false
                }

                heading = normalOnSide(ab, ao)
                return false
            }

            case 3: {
                let [c, b, a] = simplex
                let ab = b.subtract(a)
                let ac = c.subtract(a)
                let ao = a.negate()

                let inAB = ab.dot(ao) > 0
                let inAC = ac.dot(ao) > 0

                if (!inAB && !inAC) {
                    heading = ao
                    simplex = [a]
                    return false
                }

                let abNormal = normalOnSide(ab, ac).negate()
                let acNormal = normalOnSide(ac, ab).negate()

                let belowAB = abNormal.dot(ao) < 0
                let belowAC = acNormal.dot(ao) < 0

                if (belowAB && belowAC)
                    return true

                if (inAB && !belowAB) {
                    heading = abNormal
                    simplex = [b, a]
                    return false
                }

                heading = acNormal
                simplex = [c, a]
                return false
            }
        }
    }

    let i = 0
    while (true) {
        if (++i > maxIterations)
            return false
        let nextVertex = support(heading)
        if (nextVertex.dot(heading) < 0)
            return false
        simplex.push(nextVertex)
        let intersected = checkAndUpdateSimplex()
        if (intersected)
            return true
    }
}