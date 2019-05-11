import { Request, Response } from "express";
import path from "path";
import { existsSync } from "fs";
import Model from "../data/Model";

const validPathRegex = /^([a-z_0-9]+)(\/([a-z_0-9]+))?$/i

function wrapSimpleFunction(fn) {
    return function(req: Request, res: Response) {
        function sendResult(result) {
            res.type("application/json").send(Model.serializer.stringify(result))
        }
        try {
            let arg = req.body
            let result = fn(arg, req, res)
            if (result instanceof Promise) {
                result.then(sendResult)
            } else {
                sendResult(result)
            }
        } catch (e) {
            console.error(e)
        }
    }
}

export default function create(apiRequestPath: string, apiHandlerDirectories: string[]) {

    return function(req: Request, res: Response, next) {
        console.log("A ===========================")
        // we have to reserialize and parse json 
        if (req.path.startsWith(apiRequestPath)) {
            const requestPath = req.path.slice(apiRequestPath.length)
            const parsedPath = validPathRegex.exec(requestPath)
            console.log("B ===========================", {parsedPath})
            if (parsedPath != null) {
                console.log("C ===========================", {parsedPath})
                const [, handlerName, , exportName = "default"] = parsedPath
                for (let apiHandlerDirectory of apiHandlerDirectories) {
                    const file = path.join(apiHandlerDirectory, `./${handlerName}.js`)
                    console.log("D ===========================", file)
                    if (existsSync(file)) {
                        try {
                            let handlerModule = require(file)
                            //  AFTER requiring handler then we deserialize
                            //  so that it can register handlers for types it's expecting.
                            if (typeof req.body === "string") {
                                req.body = Model.serializer.parse(req.body)
                            }
                            let exportFunction = handlerModule[exportName]
                            if (typeof exportFunction === "function") {
                                if (exportFunction.length !== 2) {
                                    // we wrap simple functions with 1 parameter
                                    // or functions with 3 parameters as we assume it has 1 parameter + req + res
                                    // we DO NOT wrap 2 parameters as we assume it's req + res
                                    exportFunction = wrapSimpleFunction(exportFunction)
                                }
                                return exportFunction(req, res)
                            }
                        } catch (e) {
                            console.error(e)
                        }
                    }
                }
            }
        }

        return next()
    }
}
