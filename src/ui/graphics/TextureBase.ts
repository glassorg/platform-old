import { createTexture } from "./functions"

export default abstract class TextureBase {

    abstract glTexture: WebGLTexture
    //  uv coordinates from 0-1
    abstract left: number
    abstract top: number
    abstract right: number
    abstract bottom: number

}