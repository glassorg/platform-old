import { Request, Response } from "express"
import { IdentityRequest } from "../../server/IdentityProvider"

export function foo(req: Request, res: Response) {
    res.type("text/json").send(JSON.stringify({ message: "Hello from server foo function" }))
}

export function bar(req: Request, res: Response) {
    res.type("text/json").send(JSON.stringify({ message: "Hello from server bar function" }))
}

export default function(req: IdentityRequest, res: Response) {
    let identity = req.identity
    let name = identity && identity.name || "Unknown User"
    res.type("text/json").send(JSON.stringify({ message: `Hello ${name} from server default function` }))
}
