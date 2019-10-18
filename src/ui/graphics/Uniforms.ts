import Graphics3D from "./Graphics3D"
import Matrix4 from "../math/Matrix4"
import Vector2 from "../math/Vector2"
import Vector3 from "../math/Vector3"
import { equals } from "./functions"
import Texture from "./Texture"
import TextureBase from "./TextureBase"

export class Uniforms {
    [property: string]: any
    modelView: Matrix4 = Matrix4.identity
    projection: Matrix4 = Matrix4.identity
    screen: Vector2 = new Vector2(800, 600)
    get modelViewProjection(): Matrix4 {
        return this.projection.multiply(this.modelView)
    }
}

export function setUniform(g: Graphics3D, uniform: WebGLActiveInfo, location: WebGLUniformLocation, value) {
    let { gl } = g
    if (value != null && typeof value === "number") {
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
        if (value == null) {
            value = Texture.default
        }
        let texture = value instanceof TextureBase ? value.glTexture : g.getWebGLTexture(value)
        let index = g.bindTexture(texture, uniform.name)
        gl.uniform1i(location, index)
    }
    else {
        throw new Error("Unrecognized uniform type: " + uniform.type)
    }
}

export function createUniforms(gl: WebGLRenderingContext, invalidate: (string) => void): Uniforms {
    return new Proxy(new Uniforms(), {
        set(obj, prop, value) {
            //  if value is a string then it represents the path to a texture
            if (value === obj[prop as any])
                return true
            //  we have to invalidate before changing the value
            //  or else the flushed vertices will be wrong
            invalidate(prop)
            obj[prop as any] = value
            return true
        }
    }) as Uniforms
}
