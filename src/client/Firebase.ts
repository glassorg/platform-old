import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

type App = firebase.app.App
let app: App | null = null

export async function getApp(): Promise<App> {
    if (app == null) {
        const config = await (await fetch("/api/firebase/config")).json()
        if (config.apiKey == null) {
            throw new Error("Your package.json needs a webConfig. You can generate by creating a web app from https://console.firebase.google.com/u/0/project/<YOURPROJECTID>/settings/general/")
        }
        app = firebase.initializeApp(config)
    }
    return app
}