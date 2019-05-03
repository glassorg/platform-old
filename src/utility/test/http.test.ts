import test from "ava"
import http from "../http"

test("http", t => {
    let inObject = { foo: "Sup?", bar: "Hi There." }
    let query = http.queryFromObject(inObject)
    let outObject = http.objectFromQuery(query)
    t.deepEqual(outObject, inObject)
})