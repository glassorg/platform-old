import test from "ava"
import Color from "../Color"

test("Color", assert => {
    let red = Color.red.toInt32()
    assert.deepEqual(red, 0xFF0000FF)
})
