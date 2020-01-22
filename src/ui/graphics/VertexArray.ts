import VertexFormat from "./VertexFormat"
import VertexElement from "./VertexElement"
import * as GL from "./GL"
import Vector3 from "../math/Vector3"
import Vector2 from "../math/Vector2"
import { transfer } from "./functions"
import Vector4 from "../math/Vector4"
import { lerp } from "../math"

type Constructor<T> = new (...values: number[]) => T

export default class VertexArray {

    public readonly format: VertexFormat
    public floatData!: Float32Array
    public uintData!: Uint32Array
    private _length = 0

    constructor(format: VertexFormat, capacity = 256) {
        this.format = format
        this.setCapacity(capacity)
    }

    get length() {
        return this._length
    }

    get buffer() {
        return this.floatData?.buffer
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
        return (this.floatData?.buffer.byteLength ?? 0) / this.format.size
    }

    private grow(minimum = 0) {
        this.setCapacity(Math.max(minimum, this.capacity * 2))
    }

    private setCapacity(capacity: number) {
        if (capacity != this.capacity) {
            const newSize = capacity * this.format.size
            const buffer = this.buffer ? transfer(this.buffer, newSize) : new ArrayBuffer(newSize)
            this.floatData = new Float32Array(buffer)
            this.uintData = new Uint32Array(buffer)
        }
    }

    private getElement(name: string) {
        const element = this.format.elements[name]
        if (element == null) {
            throw new Error(`Element attribute not found: ${name}`)
        }
        return element as VertexElement
    }

    /**
     * adds a new interpolated vertex and returns its index
     **/
    addInterpolatedVertex(
        vertexIndexA: number,
        vertexIndexB: number,
        alpha = 0.5
    ): number {
        let vertexIndexC = this.length
        for (let element of this.format.elements) {
            let a = this.get(vertexIndexA, element.name)
            let b = this.get(vertexIndexB, element.name)
            let c = lerp(a, b, alpha)
            this.set(vertexIndexC, element.name, c)
        }
        return vertexIndexC
    }

    forEach<T = Vector3>(attribute: string, type: Constructor<T> | null, callback: (value: T, index: number) => void) {
        for (let i = 0; i < this.length; i++) {
            let value = this.get<T>(i, attribute, type ?? undefined)
            callback(value, i)
        }
    }

    filter<T = Vector3>(attribute: string, type: Constructor<T> | null, fn: (value: T, index: number) => T) {
        this.forEach<T>(attribute, type, (value, i) => {
            this.set(i, attribute, fn(value, i))
        })
    }

    get<T = number>(vertexIndex: number, attributeName: string, type?: Constructor<T>): T {
        const element = this.getElement(attributeName)
        const elementIndex = vertexIndex * (this.format.size >>> 2) + (element.offset >>> 2)
        const float = element.type === GL.FLOAT
        const array = float ? this.floatData : this.uintData
        switch(element.size) {
            case 1: return array[elementIndex] as any as T
            case 2: return new (type ?? Vector2)(
                array[elementIndex+0],
                array[elementIndex+1],
            ) as any as T
            case 3: return new (type ?? Vector3)(
                array[elementIndex+0],
                array[elementIndex+1],
                array[elementIndex+2],
            ) as any as T
            case 4: return new (type ?? Vector4)(
                array[elementIndex+0],
                array[elementIndex+1],
                array[elementIndex+2],
                array[elementIndex+3],
            ) as any as T
            default: throw new Error()
        }
    }

    set<T = number>(
        vertexIndex: number, attributeName: string, value: T
    ): T {
        this.setMinLength(vertexIndex + 1)
        const element = this.getElement(attributeName)
        const elementIndex = vertexIndex * (this.format.size >>> 2) + (element.offset >>> 2)
        const float = element.type === GL.FLOAT
        const array = float ? this.floatData : this.uintData
        if (element.size === 1) {
            return array[elementIndex] = value as any
        }
        else {
            (value as any).writeTo(array, elementIndex)
        }
        return value
    }

    setData(data: ArrayLike<number>) {
        this.setCapacity(this._length = data.length / this.format.components)
        let index = 0
        for (let i = 0; i < this._length; i++) {
            for (let float of this.format.floatElements) {
                (float ? this.floatData : this.uintData)[index] = data[index]
                index++
            }
        }
        return this
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
