import VertexFormat from "./VertexFormat"
import VertexElement from "./VertexElement"
import * as GL from "./GL"
import Vector3 from "../math/Vector3"
import Vector2 from "../math/Vector2"
import { transfer } from "./functions"

export default class VertexArray {

    public readonly format: VertexFormat
    private floatData!: Float32Array
    private uintData!: Uint32Array
    private _length = 0

    constructor(format: VertexFormat, capacity = 256) {
        this.format = format
        this.resize(capacity)
    }

    get length() {
        return this._length
    }

    get buffer() {
        return this.floatData?.buffer
    }

    private setMinLength(length: number) {
        if (this.capacity < length) {
            this.grow(length)
        }
        this._length = length
    }

    get capacity() {
        return this.floatData.buffer.byteLength / this.format.size
    }

    private grow(minimum = 0) {
        this.resize(Math.max(minimum, this.capacity * 2))
    }

    private resize(capacity: number) {
        const newSize = capacity * this.format.size
        const buffer = this.buffer ? transfer(this.buffer, newSize) : new ArrayBuffer(newSize)
        this.floatData = new Float32Array(buffer)
        this.uintData = new Uint32Array(buffer)
    }

    private getElement(name: string) {
        const element = this.format.elements[name]
        if (element == null) {
            throw new Error(`Element attribute not found: ${name}`)
        }
        return element as VertexElement
    }

    get(vertexIndex: number, attributeName: string) {
        const element = this.getElement(attributeName)
        const elementIndex = vertexIndex * (this.format.size >>> 2) + (element.offset >>> 2)
        const float = element.type === GL.FLOAT
        const array = float ? this.floatData : this.uintData
        return array[elementIndex]
    }
    set(vertexIndex: number, attributeName: string, value: number) {
        this.setMinLength(vertexIndex + 1)
        const element = this.getElement(attributeName)
        const elementIndex = vertexIndex * (this.format.size >>> 2) + (element.offset >>> 2)
        const float = element.type === GL.FLOAT
        const array = float ? this.floatData : this.uintData
        return array[elementIndex] = value
    }
    get2(vertexIndex: number, attributeName: string) {
        const element = this.getElement(attributeName)
        const elementIndex = vertexIndex * (this.format.size >>> 2) + (element.offset >>> 2)
        const float = element.type === GL.FLOAT
        const array = float ? this.floatData : this.uintData
        return new Vector2(
            array[elementIndex+0],
            array[elementIndex+1],
        )
    }
    set2(vertexIndex: number, attributeName: string, value: Vector2) {
        this.setMinLength(vertexIndex + 1)
        const element = this.getElement(attributeName)
        const elementIndex = vertexIndex * (this.format.size >>> 2) + (element.offset >>> 2)
        const float = element.type === GL.FLOAT
        const array = float ? this.floatData : this.uintData
        array[elementIndex+0] = value.x
        array[elementIndex+1] = value.y
        return value
    }
    get3(vertexIndex: number, attributeName: string) {
        const element = this.getElement(attributeName)
        const elementIndex = vertexIndex * (this.format.size >>> 2) + (element.offset >>> 2)
        const float = element.type === GL.FLOAT
        const array = float ? this.floatData : this.uintData
        return new Vector3(
            array[elementIndex+0],
            array[elementIndex+1],
            array[elementIndex+2]
        )
    }
    set3(vertexIndex: number, attributeName: string, value: Vector3) {
        this.setMinLength(vertexIndex + 1)
        const element = this.getElement(attributeName)
        const elementIndex = vertexIndex * (this.format.size >>> 2) + (element.offset >>> 2)
        const float = element.type === GL.FLOAT
        const array = float ? this.floatData : this.uintData
        array[elementIndex+0] = value.x
        array[elementIndex+1] = value.y
        array[elementIndex+2] = value.z
        return value
    }

    toArray() {
        const array: number[] = []
        let index = 0
        for (let i = 0; i < this._length; i++) {
            for (let float of this.format.floatElements) {
                array[index] = (float ? this.floatData : this.uintData)[index]
                index++
            }
        }
        return array
    }

}
