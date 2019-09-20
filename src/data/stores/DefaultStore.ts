import Store from "../Store"
import CompositeStore from "./CompositeStore"
import LocalStore from "./LocalStore"
import MemoryStore from "./MemoryStore"
import SessionStore from "./SessionStore"
import HashStore from "./HashStore"
import ServerStore from "./ServerStore"
import DependentStore from "./DependentStore"

export function create() {
    let stores = {
        local: (global as any).localStorage ? new LocalStore() : new MemoryStore(),
        session: (global as any).sessionStorage ? new SessionStore() : new MemoryStore(),
        hash: (global as any).location ? new HashStore() : new MemoryStore(),
        memory: new MemoryStore(),
        dependent: new DependentStore() as Store,
        server: (global as any).fetch ? new ServerStore() : new MemoryStore(),
    }
    return Object.assign(new CompositeStore(stores), stores)
}

export default interface DefaultStore extends Store {
    stores: { [name: string]: Store }
    local: Store
    session: Store
    memory: Store
    hash: Store
    server: Store
    dependent: Store
}
