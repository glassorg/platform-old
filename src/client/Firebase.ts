import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

type App = firebase.app.App
let app: App | null = null

export async function getApp(): Promise<App> {
    if (app == null) {
        const config = await (await fetch("/api/firebase/config")).json()
        app = firebase.initializeApp(config)
    }
    return app
}