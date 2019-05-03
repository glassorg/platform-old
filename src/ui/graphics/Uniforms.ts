import Graphics3D from "./Graphics3D";
import Matrix4 from "../math/Matrix4";
import Vector2 from "../math/Vector2";

export interface IUniforms {
    model: Matrix4
    view: Matrix4
    projection: Matrix4
    screen: Vector2
    readonly modelView: Matrix4
    readonly modelViewProjection: Matrix4
    readonly viewProjection: Matrix4
    [property: string]: any
}

class Uniforms {
    model: Matrix4 = Matrix4.identity
    view: Matrix4 = Matrix4.identity
    projection: Matrix4 = Matrix4.identity
    screen: Vector2 = new Vector2(800, 600)
    //  the mul order may be opposite
    get modelView(): Matrix4 {
        return this.model.multiply(this.view)
        // let out = mat4.create()
        // mat4.mul(out, this.model, this.view)
        // return out
    }
    get modelViewProjection(): Matrix4 {
        return this.modelView.multiply(this.projection)
        // let out = mat4.create()
        // mat4.mul(out, this.modelView, this.projection)
        // return out
    }
    get viewProjection(): Matrix4 {
        return this.view.multiply(this.projection)
        // let out = mat4.create()
        // mat4.mul(out, this.view, this.projection)
        // return out
    }
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

export function createUniforms(gl: WebGL2RenderingContext, invalidate: () => void): IUniforms {
    return new Proxy(new Uniforms(), {
        set(obj, prop, value) {
            // if value is a string then it represents the path to a texture
            let result = Reflect.set(obj, prop, value)
            if (result) {
                invalidate()
            }
            return result
        }
    }) as IUniforms
}
