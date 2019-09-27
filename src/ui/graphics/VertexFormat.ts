import VertexElement from "./VertexElement"
import { getGLTypeSize } from "./functions"
import * as GL from "./GL"

/**
 * This creates an array that tracks whether each 
 * For each 4 byte data section in the vertex format
 * is a float (true) or an integer (false)
 */
function get4ByteComponentTypeArray(vertexFormat: VertexFormat) {
    let array: boolean[] = []
    for (let element of vertexFormat.elements) {
        if (element.type === GL.FLOAT) {
            for (let i = 0; i < element.size; i++) {
                array.push(true)
            }
        } else if (element.type === GL.UNSIGNED_BYTE) {
            if (element.size !== 4) {
                throw new Error(`Expected size of 4, actual: ${element.size}`)
            }
            array.push(false)
        } else {
            throw new Error(`Unsupported type: ${element.type}`)
        }
    }
    return array
}

export default class VertexFormat {

    /**
     * The individual elements that make up this vertex format.
     */
    readonly elements: VertexElement[] & { [name: string]: VertexElement | undefined }
    /**
     * The size of this vertex format in bytes.
     */
    readonly size: number
    /**
     * toString value
     */
    private string: string
    /**
     * Contains true for each 4 byte component which is a float.
     * If false then the component is probably 4 packed unsignedbytes.
     */
    readonly floatElements: boolean[]

    constructor(...elements: VertexElement[]) {
        this.elements = elements as any
        for (let element of elements) {
            elements[element.name] = element
        }
        // now initialize correct offset and stride
        let offset: number = 0
        for (let element of elements) {
            element.offset = offset
            offset += element.size * getGLTypeSize(element.type)
        }
        this.size = offset
        let stride = offset
        for (let element of elements) {
            element.stride = stride
        }
        this.string = this.elements.join("")
        this.floatElements = get4ByteComponentTypeArray(this)
    }

    get components() {
        return this.size / 4
    }

    toString() {
        return this.string
    }

    static readonly position2 = new VertexFormat(
        new VertexElement("position", 2)
    )
    static readonly position = new VertexFormat(
        new VertexElement("position", 3)
    )
    static readonly positionColor = new VertexFormat(
        new VertexElement("position", 3),
        new VertexElement("color", 4)
    )
    static readonly positionTexture = new VertexFormat(
        new VertexElement("position", 3),
        new VertexElement("textureCoordinates", 2)
    )
    static readonly positionColorTexture = new VertexFormat(
        new VertexElement("position", 3),
        new VertexElement("color", 4),
        new VertexElement("textureCoordinates", 2)
    )

}
