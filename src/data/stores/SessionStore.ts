import LocalStore from "./LocalStore"
import Serializer from "../Serializer"

export default class SessionStore extends LocalStore {

    constructor(serializer?: Serializer) {
        super(sessionStorage, serializer)
    }

}
