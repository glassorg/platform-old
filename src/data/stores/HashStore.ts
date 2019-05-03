import Serializer from "../Serializer";
import Model from "../Model";
import LocalStore from "./LocalStore";

class HashStorage implements Storage {
    private hash: { [name: string]: string | null }
    private keys: string[] | null = null

    constructor () {
        this.hash = this.getHash()
    }

    private getKeys() {
        if (!this.keys)
            this.keys = Object.keys(this.hash)
        return this.keys
    }

    private getHash() {
        try {
            let hash = location.hash.slice(1).trim()
            if (hash.length > 0)
                return JSON.parse(decodeURIComponent(hash))
        } catch (e) {
            console.warn(e)
        }
        return {}
    }

    private updateHash() {
        location.hash = JSON.stringify(this.hash)
        this.keys = null // invalidate keys
    }

    get length() {
        return this.getKeys().length
    }
    key(index: number) {
        return this.getKeys()[index]
    }
    getItem(key: string) { return this.hash[key] }
    setItem(key: string, value: string) {
        this.hash[key] = value
        this.updateHash()
    }
    removeItem(key: string) {
        delete this.hash[key]
        this.updateHash()
    }
    clear() {
        this.hash = {}
        this.updateHash()
    }
}
export default class HashStore extends LocalStore {

    constructor(serializer: Serializer = Model.serializer) {
        super(new HashStorage(), serializer)
    }

}