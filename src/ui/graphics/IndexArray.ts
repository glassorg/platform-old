import VertexFormat from "./VertexFormat"
import VertexElement from "./VertexElement"
import * as GL from "./GL"
import Vector3 from "../math/Vector3"
import Vector2 from "../math/Vector2"
import { ElementType } from "./IndexBuffer"
import { transfer } from "./functions"

export default class IndexArray {

    public readonly type: ElementType
    private data!: Uint32Array | Uint16Array
    private _length = 0

    constructor(type: ElementType = ElementType.UnsignedShort, capacity = 256) {
        this.type = type
        this.resize(capacity)
    }

    get length() {
        return this._length
    }

    get buffer() {
        return this.data?.buffer
    }

    private setMinLength(length: number) {
        if (this.capacity < length) {
            this.grow(length)
        }
        this._length = length
    }

    get capacity() {
        return this.data.length
    }

    private grow(minimum = 0) {
        this.resize(Math.max(minimum, this.capacity * 2))
    }

    private resize(capacity: number) {
        const newSize = capacity * (this.type === ElementType.UnsignedShort ? 2 : 4)
        const buffer = this.buffer ? transfer(this.buffer, newSize) : new ArrayBuffer(newSize)
        this.data = new (this.type === ElementType.UnsignedInt ? Uint16Array : Uint32Array)(buffer)
    }

    get(index: number) {
        return this.data[index]
    }
    set(index: number, value: number) {
        this.setMinLength(index + 1)
        this.data[index] = value
    }

}
