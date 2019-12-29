import Store from "../data/Store";
import * as DefaultStore from "../data/stores/DefaultStore";
import FireStore from "../data/stores/FireStore";
import Namespace from "../data/Namespace";
import { getApp } from "./Firebase";
import ServerStore from "../data/stores/ServerStore";

type Options = {
    namespace: Namespace
    firestore?: boolean
}

export async function init(options: Options): Promise<boolean> {
    const { namespace } = options
    let firebase = await getApp()
    Store.default = DefaultStore.create({
        server: options.firestore ? new FireStore(namespace, firebase) : new ServerStore()
    })
    return true
}
