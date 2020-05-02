import Store from "../data/Store";
import * as DefaultStore from "../data/stores/DefaultStore";
import FireStore from "../data/stores/FireStore";
import Namespace from "../data/Namespace";
import { getApp } from "./Firebase";
import * as firebase from "firebase/app";
import ServerStore from "../data/stores/ServerStore";
import User from "../model/User";

type Options = {
    namespace: Namespace
    firestore?: boolean
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
        server: options.firestore ? new FireStore(namespace, await getApp()) : new ServerStore()
    })

    // after database creation, let's check on user status.
    // updateUser()

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
