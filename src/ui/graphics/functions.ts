import * as GL from "./GL";

const bluePixelData = new Uint8Array([0, 0, 255, 255])
export function createTexture(gl: WebGL2RenderingContext, src: string, onload: () => void) {
    // Create a texture.
    var texture = gl.createTexture()
    if (texture == null)
        throw new Error("gl.createTexture failed")
    gl.bindTexture(gl.TEXTURE_2D, texture)
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, bluePixelData)
    // Asynchronously load an image
    var image = new Image()
    image.onload = function() {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image)
        gl.generateMipmap(gl.TEXTURE_2D)
        if (onload)
            onload()
    }
    image.src = src
    return texture
}

export function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
    let shader = gl.createShader(type)
    if (shader == null)
        throw new Error("gl.createShader returned: " + shader)

    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (success)
        return shader
    let error = gl.getShaderInfoLog(shader) || "unknown createShader error"
    gl.deleteShader(shader)
    throw new Error(error)
}

export function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    var program = gl.createProgram()
    if (program == null)
        throw new Error("gl.createProgram returned: " + program)
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    var success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (success) {
        return program
    }
    
    let error = gl.getProgramInfoLog(program) || "unknown createProgram error"
    gl.deleteProgram(program)
    throw new Error(error)
}

export function getGLTypeSize(type: number) {
    if (type === GL.FLOAT || type === GL.INT)
        return 4
    if (type === GL.UNSIGNED_BYTE || type === GL.BYTE)
        return 1
    throw new Error("Unrecognized type: " + type)
}