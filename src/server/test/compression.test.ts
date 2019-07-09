import test from "ava";
import { compressors } from "../compression";
import { readFileSync, writeFileSync, fstat } from "fs";
import { join } from "path";

test("Compression Performance", assert => {
    let count = 1
    let originalInput = readFileSync(join(__dirname, "data.json"), "utf8")
    let input = JSON.parse(originalInput)
    let inputLength = JSON.stringify(input).length
    for (let compressor of compressors ) {
        let compressStartTime = Date.now()
        let compressed!: any
        for (let i = 0; i < count; i++) {
            compressed = compressor.compressJson(input)
        }
        let compressTime = Date.now()
        // get compressed length now BEFORE possible mutation
        let compressedLength = JSON.stringify(compressed).length
        let decompressStartTime = Date.now()
        let output!: any
        for (let i = 0; i < count; i++) {
            output = compressor.decompressJson(compressed)
        }
        let decompressTime = Date.now()
        let ctime = (compressTime - compressStartTime) / 1000
        let dtime = (decompressTime - decompressStartTime) / 1000
        let ratio = Math.round(compressedLength / inputLength * 100)
        // console.log(JSON.stringify(compressed).length + " " + JSON.stringify(input).length)
        assert.deepEqual(JSON.stringify(input), JSON.stringify(output))
        // console.log(`###########################################################`)
        // console.log(`${compressor.name}: ratio: ${ratio}%, compress: ${ctime}, decompress: ${dtime}`)
        // console.log(`###########################################################`)
    }
})
