import Vector3 from "./Vector3"

export default class Rotor {

    readonly scalar: number
    readonly yz: number
    readonly zx: number
    readonly xy: number

    constructor( scalar: number, yz: number, zx: number, xy: number ) {
        this.scalar = scalar
        this.yz = yz
        this.zx = zx
        this.xy = xy
    }

    /*
        Basis bivector times table:
                yz   zx   xy
            yz  -1  -xy   zx
            zx  xy  -1   -yz
            xy -xz   yz   -1
    */
    multiply( R: Rotor ) {
        let L = this
        return new Rotor(
            // scalar
            L.scalar * R.scalar

            - L.yz * R.yz
            - L.zx * R.zx
            - L.xy * R.xy,

            // yz
            L.scalar * R.yz
            + L.yz * R.scalar

            + L.xy * R.zx
            - L.zx * R.xy,

            // zx
            L.scalar * R.zx
            + L.zx * R.scalar

            + L.yz * R.xy
            - L.xy * R.yz,

            // xy
            L.scalar * R.xy
            + L.xy * R.scalar

            + L.zx * R.yz
            - L.yz * R.zx
        )
    }

    inverse() {
        return new Rotor( this.scalar, -this.yz, -this.zx, -this.xy )
    }

    axis() {
        return new Vector3(
            this.yz,
            this.zx,
            this.xy
        )
    }

    angle() {
        return Math.atan2( this.axis().length(), this.scalar ) * 2
    }

    rotateVector( v: Vector3 ) {
        // TODO: Expand this out product to avoid allocation.
        return this.inverse().multiply( new Rotor( 0, v.x, v.y, v.z ) ).multiply( this ).axis()
    }

    toMatrix4() {

    }

    static rotation( axis: Vector3, angle: number ) {
        let { x, y, z } = axis
        let theta = angle / 2
        let scale = Math.sin( theta ) / Math.hypot( x, y, z )
        return new Rotor(
            Math.cos( theta ),
            x * scale,
            y * scale,
            z * scale
        )
    }

    static rotationBetween( a: Vector3, b: Vector3 ) {
        let midX = a.x + b.x
        let midY = a.y + b.y
        let midZ = a.z + b.z
        let invH = 1 / Math.hypot( midX, midY, midZ )
        return Rotor._multiplyVectors( a, midX * invH, midY * invH, midZ * invH )
    }

    // The geometric product of two vectors gives a rotor for twice the angle between them in the plane formed between them.
    static multiplyVectors( a: Vector3, b: Vector3 ) {
        return Rotor._multiplyVectors( a, b.x, b.y, b.z )
    }

    private static _multiplyVectors( a: Vector3, bx: number, by: number, bz: number ) {
        return new Rotor(
            // The scalar part is a dot b.
            a.x * bx + a.y * by + a.z * bz,
            // The bivector part is a cross b.
            a.y * bz - a.z * by,
            a.z * bx - a.x * bz,
            a.x * by - a.y * bx
        )
    }

}