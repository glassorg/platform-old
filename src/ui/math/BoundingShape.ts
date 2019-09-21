import Capsule from "./Capsule"
import Line from "./Line"
import Vector3 from "./Vector3"

export default interface BoundingShape {

    /**
     *  returns true if this bounding shape intersects this capsule at all
     */
    intersects(capsule: Capsule): boolean
    /**
     * Returns the closest point to the line which lies within this bounding shape.
     * If multiple points intersect the line the point closest to 'a' is preferred.
     */
    getClosestPoint(line: Line): Vector3


}