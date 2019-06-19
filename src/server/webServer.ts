import express, { Request, Response, Express } from "express";
import Datastore from "./gcloud/Datastore";
import Database from "./gcloud/Database";
import apiRouter from "./apiRouter";
import path from "path";
import fs from "fs";
import methodEmulator from "./methodEmulator";
import bodyParser = require("body-parser");
import Namespace, { isNamespace } from "../data/Namespace";
import IdentityProvider from "./IdentityProvider";
import Firestore from "./gcloud/Firestore";

export type Config = {
    projectRoot: string,
    namespace?: Namespace,
    secrets?: {
        jwtSignature: string,
        encryptionKey: string
    },
    twilio?: {
        fromPhone: string,
        account: string,
        token: string
    },
    sendgrid?: {
        apiKey: string
    }
}

export let instance: { database: Database, config: Config & { namespace: Namespace } } & Express

/**
 * Initializes the standard glass web server.
 * @param projectRoot the root directory of the project
 * @param namespaceOrPath the entity namespace or a string to the namespace module relative to the projectRoot
 */
export function create(config: Config) {
    let { projectRoot, namespace } = config
    let namespaceOrPath = config.namespace
    if (!isNamespace(namespace)) {
        let namespacePath = path.join(projectRoot, "./lib/model/index.js")
        try {
            namespace = require(namespacePath)
        } catch (e) {
            namespace = {}
            console.warn(`Error loading webServer namespace: ${namespacePath}`)
        }
    }
    const packageProperties = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json")).toString())
    let projectId = packageProperties.id || packageProperties.name
    process.env.DATASTORE_PROJECT_ID = projectId
    let credentialsPath = path.join(projectRoot, "credentials.json")
    if (fs.existsSync(credentialsPath))
        process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath

    let database = packageProperties.firestore ? new Firestore({namespace:namespace!}) : new Datastore(namespace!)
    instance = Object.assign(express(), { config, database }) as any
    // parse identity token
    instance.use(IdentityProvider)
    instance.use(bodyParser.text({ type: "application/json", limit: 10 * 1000 * 1000 }))
    instance.use(methodEmulator)

    // dynamic loading of api, this isn't working with webpack?
    const apiRoot = path.join(projectRoot, "lib/www/api")
    const glassApiRoot = path.join(projectRoot, `node_modules/@glas/platform/www/api`)
    instance.use(apiRouter("/api/", [apiRoot, glassApiRoot]))

    const webRoot = path.join(projectRoot, "lib/www")
    instance.use(express.static(webRoot))

    const port = process.env.PORT || 3000
    instance.listen(port, () => {
        console.log(`${projectId} listening on port ${port}.`)
    })

    return instance
}
