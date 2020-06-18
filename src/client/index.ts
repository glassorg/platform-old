import Store from "../data/Store";
import * as DefaultStore from "../data/stores/DefaultStore";
import FireStore from "../data/stores/FireStore";
import Namespace from "../data/Namespace";
import { getApp, FirebaseConfig } from "./Firebase";
import * as firebase from "firebase/app";
import ServerStore from "../data/stores/ServerStore";
import User from "../model/User";

type Options = {
    namespace: Namespace
    firebase: FirebaseConfig
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

export async function init(options: Options): Promise<boolean> {
    const { namespace } = options
    Store.default = DefaultStore.create({
        server: options.firebase ? new FireStore(namespace, getApp(options.firebase)) : new ServerStore()
    })

    return new Promise((resolve, reject) => {
        if (options.firebase) {
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
        }
        else {
            resolve(true)
        }
    })
}
