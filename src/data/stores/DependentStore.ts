import Key from "../Key"
import MemoryStore from "./MemoryStore"
import Dependent from "../Dependent"
import { string } from "../schema"

export default class DependentStore extends MemoryStore {

    ensureWatched<T extends Dependent>(key: Key<T>) {
        let newlyWatched = super.ensureWatched(key)
        if (newlyWatched) {
            let type = key.type as any
            type.watched(key)
        }
        return newlyWatched
    }

}