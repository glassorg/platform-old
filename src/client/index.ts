import Store from "../data/Store";
import * as DefaultStore from "../data/stores/DefaultStore";
import FireStore from "../data/stores/FireStore";
import Namespace from "../data/Namespace";
import { FirebaseConfig, initializeApp } from "./Firebase";
import * as firebase from "firebase/app";
import User from "../model/User";
import MemoryStore from "../data/stores/MemoryStore";
import Context from "../ui/Context";

type Options = {
    namespace: Namespace,
    firebase?: FirebaseConfig,
}

function updateUser() {
    let user = firebase.auth().currentUser
    if (user) {
        let newUser = new User({
            id: user.uid,
            name: user.displayName,
            email: user.email,
            emailVerified: user.emailVerified,
            photoUrl: user.photoURL
        })
        Store.default.patch(User.key, newUser)
        console.log("Client Init User", newUser)
    }
    else {
        Store.default.delete(User.key)
        console.log("Client Init no user")
    }
}

export function init(options: Options): Promise<boolean> {
    const { namespace } = options
    Store.default = DefaultStore.create({
        server: options.firebase ? new FireStore(namespace, initializeApp(options.firebase)) : new MemoryStore()
    })

    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(
            function (user) {
                updateUser()
                resolve(true)
            },
            function (error) {
                console.log(error)
                resolve(false)
            }
        );
    })
}

export async function bind(options: Options, render: (c: Context) => void, selector = "app") {
    await init(options)
    const element = document.querySelector(selector) as HTMLElement
    if (element == null) {
        throw new Error(`Element not found ${selector}`)
    }
    Context.bind(render, undefined, element)
}
