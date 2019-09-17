import Vector3 from "./Vector3";
import { equivalent } from ".";
import Sphere from "./Sphere";

export default class Ray {

    readonly point: Vector3
    readonly unitHeading: Vector3

    constructor( point: Vector3, heading: Vector3 ) {
        this.point = point
        if ( !equivalent( heading.lengthSquared(), 1 ) )
            this.unitHeading = heading.normalize()
        else
            this.unitHeading = heading
    }

    getPosition( distance: number ) {
        return this.point.add( this.unitHeading.scale( distance ) )
    }

    containsPoint( point: Vector3 ) {
        return equivalent( point.subtract( this.point ).dot( this.unitHeading ), 0 )
    }

    distanceToSphere( s: Sphere, front: boolean = true ) {
        let toSphere = s.center.subtract( this.point )
        let parallelDist = toSphere.dot( this.unitHeading )
        if ( parallelDist < 0 )
            return null
        let perpendicular = this.unitHeading.rejection( toSphere )
        let perpendicularDistSq = perpendicular.lengthSquared()
        let radiusSq = s.radius ** 2
        if ( perpendicularDistSq > radiusSq )
            return null
        let radiusOfSlice = Math.sqrt( radiusSq - perpendicularDistSq )
        return front ?
            parallelDist - radiusOfSlice :
            parallelDist + radiusOfSlice
    }

    castSphere( s: Sphere, front: boolean = true ) {
        let distance = this.distanceToSphere( s, front )
        if ( distance === null )
            return null
        return this.getPosition( distance )
    }

}