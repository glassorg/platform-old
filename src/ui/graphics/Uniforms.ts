import Graphics3D from "./Graphics3D";
import Matrix4 from "../math/Matrix4";
import Vector2 from "../math/Vector2";
import Vector3 from "../math/Vector3";

export class Uniforms {
    [property: string]: any
    model: Matrix4 = Matrix4.identity
    view: Matrix4 = Matrix4.identity
    projection: Matrix4 = Matrix4.identity
    screen: Vector2 = new Vector2(800, 600)
    //  the mul order may be opposite
    get modelView(): Matrix4 {
        return this.model.multiply(this.view)
    }
    get modelViewProjection(): Matrix4 {
        return this.modelView.multiply(this.projection)
    }
    get viewProjection(): Matrix4 {
        return this.view.multiply(this.projection)
    }
    translate(dx: number, dy: number, dz: number = 0) {
        this.transform(Matrix4.translation(dx, dy, dz))
    }
    rotate(angle: number) {
        this.transform(Matrix4.rotation(new Vector3(0, 0, 1), angle)!)
    }
    scale(sx: number, sy: number = sx, sz: number = sx) {
        this.transform(Matrix4.scaling(sx, sy, sz))
    }
    transform(m: Matrix4) {
        this.model = m.multiply(this.model)
    }
}

function equals(a, b) {
    if (a === b) {
        return true
    }
    if (a == null || b == null) {
        return false
    }
    if (typeof a.equals === "function") {
        return a.equals(b) ? true : false
    }
    return false
}

export function setUniform(g: Graphics3D, uniform: WebGLActiveInfo, location: WebGLUniformLocation, value) {
    let { gl } = g
    if (value != null && value.length == null) {
        value = [value]
    }

    if (uniform.type === gl.FLOAT_MAT4) {
        gl.uniformMatrix4fv(location, false, value)
    }
    else if (uniform.type === gl.FLOAT_VEC4) {
        gl.uniform4fv(location, value)
    }
    else if (uniform.type === gl.FLOAT_VEC3) {
        gl.uniform3fv(location, value)
    }
    else if (uniform.type === gl.FLOAT_VEC2) {
        gl.uniform2fv(location, value)
    }
    else if (uniform.type === gl.FLOAT) {
        gl.uniform1fv(location, value)
    }
    else if (uniform.type === gl.SAMPLER_2D) {
        let texture = g.getWebGLTexture(value)
        let index = g.bindTexture(texture)
        gl.uniform1i(location, index)
    }
    else {
        throw new Error("Unrecognized uniform type: " + uniform.type)
    }
}

export function createUniforms(gl: WebGL2RenderingContext, invalidate: (string) => void): Uniforms {
    return new Proxy(new Uniforms(), {
        set(obj, prop, value) {
            //  if value is a string then it represents the path to a texture
            if (equals(value, Reflect.get(obj, prop))) {
                return true
            }
            //  we have to invalidate before changing the value
            //  or else the flushed vertices will be wrong
            invalidate(prop)
            return Reflect.set(obj, prop, value)
        }
    }) as Uniforms
}
