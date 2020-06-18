
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

export type FirebaseApp = firebase.app.App
export type FirebaseConfig = {
    apiKey: String,
    authDomain: String,
    databaseURL: String,
    projectId: String,
    storageBucket: String,
    messagingSenderId: String,
    appId: String,
};

type App = firebase.app.App
let app: App | null = null

export function getApp(config: FirebaseConfig): App {
    if (app == null) {
        console.log("Creating App ======")
        app = firebase.initializeApp(config)
    }
    return app
}