import { Request, Response, NextFunction } from "express"
import Identity from "../model/Identity"
import * as crypto from "../utility/crypto"

const accessTokenSecret = "Our access tokens are only signed with this key."

export type IdentityRequest = Request & { identity?: Identity }
export function signToken(token: Identity, duration: number) {
    return crypto.jwtSign(token, accessTokenSecret, duration)
}
export default function(req: IdentityRequest, res: Response, next: NextFunction) {
    let token = req.headers.token
    if (typeof token === "string") {
        let message = crypto.jwtVerify(token, accessTokenSecret)
        if (message) {
            req.identity = new Identity(message, { token })
        }
    }
    next()
}
