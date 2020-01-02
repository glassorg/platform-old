import test from "ava"
import http, { getRelativeUrl } from "../http"

test("getRelativeUrl", assert => {
    assert.deepEqual(getRelativeUrl("/foo/bar", "baz"), "/foo/baz")
    assert.deepEqual(getRelativeUrl("/foo/bar", "/baz"), "/baz")
})

test("http", assert => {
    let inObject = { foo: "Sup?", bar: "Hi There." }
    let query = http.queryFromObject(inObject)
    let outObject = http.objectFromQuery(query)
    assert.deepEqual(outObject, inObject)
})