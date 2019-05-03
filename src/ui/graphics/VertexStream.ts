import VertexBuffer from "./VertexBuffer";
import * as GL from "./GL";
import VertexFormat from "./VertexFormat";


export default class VertexStream {

    private floatData: Float32Array
    private uintData: Uint32Array
    buffer: VertexBuffer
    size: number = 0

    constructor(buffer: VertexBuffer, count = 64 * 1024) {
        this.buffer = buffer
        let data = new ArrayBuffer(count * 4)
        this.floatData = new Float32Array(data)
        this.uintData = new Uint32Array(data)
    }

    flush() {
        if (this.size > 0) {
            this.draw()
            this.size = 0
        }
    }
    
    draw() {
        this.buffer.setData(this.floatData, this.size)
        this.buffer.draw()
        this.size = 0
    }

    write(...components: number[]) {
        if (this.size + components.length > this.floatData.length) {
            this.flush()
        }
        let floatElements = this.buffer.vertexFormat.floatElements
        for (let i = 0; i < components.length; i++) {
            if (floatElements[i % floatElements.length]) {
                this.floatData[this.size++] = components[i]
            } else {
                this.uintData[this.size++] = components[i]
            }
        }
    }

}