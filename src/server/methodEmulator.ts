import { Request, Response } from "express"

const methods = new Set(["POST", "PUT", "DELETE"])

export default function methodEmulator(req: Request, res: Response, next) {
    // console.log("req.method", req.method)
    if (req.method === "GET") {
        let url = req.url
        let lastIndex = url.lastIndexOf("?")
        if (lastIndex > 0) {
            let query = url.slice(lastIndex + 1)
            let firstEqual = query.indexOf("=")
            if (firstEqual > 0) {
                let method = query.slice(0, firstEqual)
                if (methods.has(method)) {
                    let content = JSON.parse(decodeURIComponent(query.slice(firstEqual + 1)))
                    req.url = url.slice(0, lastIndex)
                    req.body = content
                    req.method = method
                }
            }
        }
    }
    next();
}