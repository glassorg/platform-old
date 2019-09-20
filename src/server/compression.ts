import * as zlib from "zlib"
// import * as jp from "jsonpack"
import * as jc from "../utility/jsonCompressor"

const encoding = "base64"
type JsonObject = string | boolean | number | object | null

export class Compressor {

    readonly name!: string

    constructor(args: { name } & { [p in keyof Compressor]?: Compressor[p] }) {
        Object.assign(this, args)
    }

    compressJson(json: JsonObject): JsonObject {
        return this.compress(JSON.stringify(json))
    }
    decompressJson(compressedJson: JsonObject): JsonObject {
        return JSON.parse(this.decompress(compressedJson as string))
    }
    compress(uncompressed: string): string {
        return this.compressBuffer(Buffer.from(uncompressed)).toString(encoding)
    }
    decompress(compressed: string): string {
        return this.decompressBuffer(Buffer.from(compressed, encoding)).toString()
    }
    compressBuffer(uncompressed: Buffer) {
        return uncompressed
    }
    decompressBuffer(compressed: Buffer) {
        return compressed
    }

}

export const deflate = new Compressor({
    name: "deflate",
    compressBuffer(uncompressed: Buffer) {
        return zlib.deflateSync(uncompressed, { level: 1 })
    },
    decompressBuffer(compressed: Buffer) {
        return zlib.inflateSync(compressed)
    }
})

export const gzip = new Compressor({
    name: "gzip",
    compressBuffer(uncompressed: Buffer) {
        return zlib.gzipSync(uncompressed, { level: 1 })
    },
    decompressBuffer(compressed: Buffer) {
        return zlib.gunzipSync(compressed)
    }
})

// export const jsonpack = new Compressor({
//     name: "jsonpack",
//     compressJson(json: JsonObject): JsonObject {
//         return jp.pack(JSON.stringify(json))
//     },
//     decompressJson(compressedJson: JsonObject): JsonObject {
//         return jp.unpack(compressedJson)
//     }
// })

export const jsonCompression = new Compressor({
    name: "jsonCompression",
    compressJson(json: JsonObject): JsonObject {
        return jc.compress(json)
    },
    decompressJson(compressedJson: JsonObject): JsonObject {
        return jc.decompress(compressedJson)
    }
})

export const compressors = [ deflate, gzip, /* jsonpack ,*/ jsonCompression ]
