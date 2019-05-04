import test from "ava"
import * as crypto from "../crypto"

test("crypto", assert => {
    assert.true(crypto.id() !== crypto.id())
    assert.true(crypto.base64Encode("foo") !== "foo")
    assert.true(crypto.base64Decode(crypto.base64Encode("foozle")) === "foozle")
})

test("hash", assert => {
    // make sure hashes are salted
    assert.notDeepEqual(crypto.hash("foo"), crypto.hash("foo"))
    // does checkHash work?
    let hashed = crypto.hash("foo")
    assert.true(crypto.hashVerify("foo", hashed))
    assert.false(crypto.hashVerify("bar", hashed))
})

test("JWT", assert => {
    let key = "aKey"
    let inMessage = { name: "Kody", password: "abc123", iq: 0 }

    let token = crypto.jwtSign(inMessage, key)
    let outMessage = crypto.jwtVerify(token, key) as any
    assert.deepEqual(inMessage, outMessage)

    assert.deepEqual(null, crypto.jwtVerify(token, "otherKey"))

    assert.notThrows(() => crypto.jwtVerify(crypto.jwtSign(inMessage, key, 1000), key))
    assert.deepEqual(crypto.jwtVerify(crypto.jwtSign(inMessage, key, -1000), key), null)

    let value = { foo: "bar" }
    let password = "foobar"
    assert.deepEqual(value, crypto.decrypt(crypto.encrypt(value, password), password))
})