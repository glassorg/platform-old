import { Request, Response } from "express"
import { IdentityRequest } from "../../server/IdentityProvider"
import * as webServer from "../../server/webServer"

export function config() {
    return webServer.instance.package.firebase?.webConfig ?? {}
}
