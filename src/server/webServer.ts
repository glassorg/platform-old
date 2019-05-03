import express, { Request, Response, Express } from "express";
import apiRouter from "./apiRouter";
import path from "path";
import fs from "fs";
import methodEmulator from "./methodEmulator";
import bodyParser = require("body-parser");
import Model from "../data/Model";
import Namespace, { isNamespace } from "../data/Namespace";
import IdentityProvider from "./IdentityProvider";

export let instance: { projectRoot: string, namespace: Namespace } & Express

/**
 * Initializes the standard glass web server.
 * @param projectRoot the root directory of the project
 * @param namespaceOrPath the entity namespace or a string to the namespace module relative to the projectRoot
 */
export function create(projectRoot = "./", namespaceOrPath: string | Namespace = "./lib/model/index.js") {
    let namespace: Namespace
    if (isNamespace(namespaceOrPath)) {
        namespace = namespaceOrPath
    } else {
        try {
            namespace = require(path.join(projectRoot, namespaceOrPath))
        } catch (e) {
            namespace = {}
            console.warn(`Error loading webServer namespace: ${namespaceOrPath}`)
        }
    }
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json")).toString())
    let { name: projectId } = packageJson
    process.env.DATASTORE_PROJECT_ID = projectId
    let credentialsPath = path.join(projectRoot, "credentials.json")
    if (fs.existsSync(credentialsPath))
        process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath

    instance = Object.assign(express(), { projectRoot, namespace })
    // parse identity token
    instance.use(IdentityProvider)

    instance.use(bodyParser.text({ type: "application/json" }))
    instance.use(methodEmulator)

    const apiRoot = path.join(projectRoot, "lib/www/api")
    const glassApiRoot = path.join(projectRoot, "node_modules/@krisnye/glass-platform/www/api")
    instance.use(apiRouter("/api/", [apiRoot, glassApiRoot]))

    const webRoot = path.join(projectRoot, "lib/www")
    instance.use(express.static(webRoot))

    const port = process.env.PORT || 3000
    instance.listen(port, () => {
        console.log(`${projectId} listening on port ${port}.`)
    })

    return instance
}
