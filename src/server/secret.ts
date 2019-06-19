import * as crypto from "../utility/crypto";
import * as webServer from "./webServer";

export function getJwtSignature() {
    return webServer.instance.config.secrets!.jwtSignature.toString()
}

export function getEncryptionKey() {
    return webServer.instance.config.secrets!.encryptionKey.toString()
}

/**
 * Encrypts a message with the package.json secret.encryptionKey
 */
export function encrypt(message: any) {
    return crypto.encrypt(message, getEncryptionKey())
}

/**
 * Decrypts a message with the package.json secret.encryptionKey
 */
export function decrypt(encryptedMessage: string) {
    return crypto.decrypt(encryptedMessage, getEncryptionKey())
}

/**
 * Signs a json web token with the package.json secret.jwtSignature
 */
export function jwtSign(token: object, duration: number) {
    return crypto.jwtSign(token, getJwtSignature(), duration)
}
/**
 * Verifies a json web token with the package.json secret.jwtSignature
 * and then returns the parsed results or else null.
 */
export function jwtVerify(jwt: string) {
    return crypto.jwtVerify(jwt, getJwtSignature())
}
