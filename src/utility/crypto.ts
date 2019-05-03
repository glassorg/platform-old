import s from "sjcl"

const encryptOptions = { count:2048, ks:256 }
export function id() { return base64Encode(s.random.randomWords(2)) }
export function base64Encode(plainText) { return s.codec.base64url.fromBits(s.codec.utf8String.toBits(plainText)) }
export function base64Decode(base64EncodedText) { return s.codec.utf8String.fromBits(s.codec.base64url.toBits(base64EncodedText))}
export function hash(text) { return s.codec.base64url.fromBits(s.hash.sha256.hash(text)) }
export function sign(text, key) { return s.codec.base64url.fromBits(new s.misc.hmac(s.codec.utf8String.toBits(key), s.hash.sha256).encrypt(text)) }
export function encrypt(object, password) { return base64Encode(s.encrypt(password, JSON.stringify(object), encryptOptions as any)) }
export function decrypt(text, password) { return JSON.parse(s.decrypt(password, base64Decode(text), encryptOptions)) }

export function jwtSign(message, key, expirationSeconds?) {
    let header = { alg: "HS256", typ: "JWT" }
    if (expirationSeconds) {
        message = JSON.parse(JSON.stringify(message))
        message.exp = (Date.now() / 1000) + expirationSeconds
    }
    let header64 = base64Encode(JSON.stringify(header))
    let message64 = base64Encode(JSON.stringify(message))
    let signature = sign(header64 + "." + message64, key)
    return header64 + "." + message64 + "." + signature
}

export function jwtVerify(token, key): { exp: number, [name: string]: any } | null {
    let [header64, message64, signature] = token.split(".")
    let header = JSON.parse(base64Decode(header64))
    if (header.alg !== "HS256") {
        return null
    }
    let message = JSON.parse(base64Decode(message64))
    if (message.exp && Date.now() > message.exp * 1000) {
        return null
    }
    if (signature !== sign(header64 + "." + message64, key)) {
        return null
    }
    return message
}
