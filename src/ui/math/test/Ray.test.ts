import test from "ava"
import Ray from "../Ray"
import Vector3 from "../Vector3"
import Sphere from "../Sphere"
import { equivalent } from ".."

test( "Ray", assert => {
    let r = new Ray( new Vector3( 0, Math.sin( Math.PI / 4 ), 0 ), new Vector3( 1, 0, 0 ) )
    let s = new Sphere( new Vector3( 1, 0, 0 ), 1 )
    let d = r.distanceToSphere( s )
    if ( d === null )
        return assert.fail()
    assert.true(
        equivalent(
            ( 1 - d ),
            Math.sqrt( 2 ) / 2
        )
    )
} )
