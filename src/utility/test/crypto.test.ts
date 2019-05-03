import test from "ava"
import * as crypto from "../crypto"

test("crypto", t => {
    t.true(crypto.id() !== crypto.id())
    t.true(crypto.base64Encode("foo") !== "foo")
    t.true(crypto.base64Decode(crypto.base64Encode("foozle")) === "foozle")
})

test("JWT", t => {
    let key = "aKey"
    let inMessage = { name: "Kody", password: "abc123", iq: 0 }

    let token = crypto.jwtSign(inMessage, key)
    let outMessage = crypto.jwtVerify(token, key) as any
    t.deepEqual(inMessage, outMessage)

    t.deepEqual(null, crypto.jwtVerify(token, "otherKey"))

    t.notThrows(() => crypto.jwtVerify(crypto.jwtSign(inMessage, key, 1000), key))
    t.deepEqual(crypto.jwtVerify(crypto.jwtSign(inMessage, key, -1000), key), null)

    let value = { foo: "bar" }
    let password = "foobar"
    t.deepEqual(value, crypto.decrypt(crypto.encrypt(value, password), password))
})