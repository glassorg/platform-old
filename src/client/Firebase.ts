import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

export type FirebaseApp = firebase.app.App
export type FirebaseConfig = {
    configSource: String,
    webConfig: {
        apiKey: String,
        authDomain: String,
        databaseURL: String,
        projectId: String,
        storageBucket: String,
        messagingSenderId: String,
        appId: String,
    }
};

export function initializeApp(config: FirebaseConfig) {
    return firebase.initializeApp(config)
}