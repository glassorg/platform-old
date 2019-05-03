import { Request, Response } from "express"

export default function methodEmulator(req: Request, res: Response, next) {
    // console.log("req.method", req.method)
    if (req.method === "GET") {
        // console.log("query", req.query)
        for (let method of ["POST", "PUT", "DELETE"]) {
            if (req.query[method]) {
                req.body = req.query[method];
                req.method = method;
            }
        }
    }
    next();
}