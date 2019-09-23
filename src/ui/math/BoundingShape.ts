import Capsule from "./Capsule"
import Line from "./Line"
import Vector3 from "./Vector3"

export default interface BoundingShape {

    /**
     *  returns something truthy if this bounding shape intersects this capsule at all
     */
    intersectsCapsule(capsule: Capsule): any
    /**
     * Returns the closest point to the line which lies within this bounding shape.
     */
    getClosestPoint(line: Line): Vector3


}