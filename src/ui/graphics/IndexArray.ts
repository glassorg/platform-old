import VertexFormat from "./VertexFormat"
import VertexElement from "./VertexElement"
import * as GL from "./GL"
import Vector3 from "../math/Vector3"
import Vector2 from "../math/Vector2"
import { ElementType } from "./IndexBuffer"
import { transfer } from "./functions"

export default class IndexArray {

    public readonly type: ElementType
    public data!: Uint32Array | Uint16Array
    private _length = 0

    constructor(capacity = 256, type: ElementType = ElementType.UnsignedShort) {
        this.type = type
        this.setCapacity(capacity)
    }

    get length() {
        return this._length
    }

    get buffer() {
        return this.data?.buffer
    }

    private ensureCapacity(capacity: number) {
        if (this.capacity < capacity) {
            this.grow(capacity)
        }
    }

    private setMinLength(length: number) {
        this.ensureCapacity(length)
        this._length = Math.max(this._length, length)
    }

    get capacity() {
        return this.data?.length ?? 0
    }

    private grow(minimum = 0) {
        this.setCapacity(Math.max(minimum, this.capacity * 2))
    }

    private setCapacity(capacity: number) {
        if (capacity != this.capacity) {
            const newSize = capacity * (this.type === ElementType.UnsignedShort ? 2 : 4)
            const buffer = this.buffer ? transfer(this.buffer, newSize) : new ArrayBuffer(newSize)
            this.data = new (this.type === ElementType.UnsignedShort ? Uint16Array : Uint32Array)(buffer)
        }
    }

    push(...values: number[]) {
        const length = this.length
        this.setMinLength(length + values.length)
        this.data.set(values, length)
    }

    get(index: number) {
        return this.data[index]
    }
    set(index: number, value: number) {
        this.setMinLength(index + 1)
        this.data[index] = value
    }

    setData(data: ArrayLike<number>) {
        this.setCapacity(this._length = data.length)
        this.data.set(data, 0)
        return this
    }

    toArray() {
        return [...this.data]
    }

}
