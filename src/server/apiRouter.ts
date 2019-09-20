import { Request, Response } from "express"
import path from "path"
import { existsSync } from "fs"
import Model from "../data/Model"

const validPathRegex = /^([a-z_0-9]+)(\/([a-z_0-9]+))?(.*)$/i

function wrapSimpleFunction(fn) {
    return function(req: Request, res: Response) {
        function sendResult(result) {
            res.type("application/json").send(Model.serializer.stringify(result))
        }
        function handleError(e) {
            console.error(e)
            res.status(500).send(e.toString())
        }
        try {
            let arg = req.body
            let result = fn(arg, req, res)
            if (result instanceof Promise) {
                result.then(sendResult).catch(handleError)
            } else {
                sendResult(result)
            }
        } catch (e) {
            handleError(e)
        }
    }
}

export default function create(apiRequestPath: string, apiHandlerDirectories: string[]) {

    return function(req: Request, res: Response, next) {
        // console.log("A ===========================")
        // we have to reserialize and parse json 
        if (req.path.startsWith(apiRequestPath)) {
            const url = decodeURIComponent(req.url)
            const requestPath = url.slice(apiRequestPath.length)
            const parsedPath = validPathRegex.exec(requestPath)
            // console.log("B ===========================", {url,parsedPath})
            if (parsedPath != null) {
                let [, handlerName, , exportName = "default", content] = parsedPath
                // console.log("C ===========================", {handlerName, exportName, content})
                for (let apiHandlerDirectory of apiHandlerDirectories) {
                    const file = path.join(apiHandlerDirectory, `./${handlerName}.js`)
                    // console.log("D ===========================", file)
                    if (existsSync(file)) {
                        let handlerModule = require(file)
                        //  AFTER requiring handler then we deserialize
                        //  so that it can register handlers for types it's expecting.
                        let exportFunction = handlerModule[exportName]
                        // this is new to handle default
                        if (exportFunction == null) {
                            content = exportFunction + content
                            exportFunction = handlerModule.default
                        }
                        if (typeof req.body === "string") {
                            req.body = Model.serializer.parse(req.body)
                        }
                        if (req.method === "GET" && content.length > 0) {
                            req.body = content.slice(1)
                        }
                        if (typeof exportFunction === "function") {
                            if (exportFunction.length !== 2) {
                                // we wrap simple functions with 1 parameter
                                // or functions with 3 parameters as we assume it has 1 parameter + req + res
                                // we DO NOT wrap 2 parameters as we assume it's req + res
                                exportFunction = wrapSimpleFunction(exportFunction)
                            }
                            return exportFunction(req, res)
                        }
                    }
                }
            }
        }

        return next()
    }
}
