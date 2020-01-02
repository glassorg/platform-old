import ResourceLoader from "./ResourceLoader";
import Graphics from "../Graphics";
import Node from "../scene/Node";
import Invalidatable from "../Invalidatable";

class ResourceInfo<T = any> {

    loading = false
    dependents = new Set<Invalidatable>()
    value?: T

}

export default class ResourceManager {

    g: Graphics
    resources: Map<ResourceLoader,Map<string,ResourceInfo>>

    constructor(g: Graphics) {
        this.g = g
        this.resources = new Map<ResourceLoader,Map<string,ResourceInfo>>()
    }

    private info<T>(loader: ResourceLoader<T>, id: string): ResourceInfo<T> {
        let resources = this.resources.get(loader)
        if (resources == null) {
            this.resources.set(loader, resources = new Map())
        }
        let info = resources.get(id)
        if (info == null) {
            resources.set(id, info = new ResourceInfo())
        }
        return info
    }

    public load<T>(loader: ResourceLoader<T>, id: string): Promise<T> {
        return new Promise((resolve, reject) => {
            let result = this.get(loader, id, { invalidate(value: T) {
                resolve(value)
            }})
            if (result != null) {
                resolve(result)
            }
        })
    }

    public get<T>(loader: ResourceLoader<T>, id: string, dependent: Invalidatable): T | null {
        let info = this.info(loader, id)
        if (!info.loading) {
            info.loading = true
            loader.load(this.g, id).then(value => {
                info.value = value
                for (let dependent of info.dependents.values()) {
                    dependent.invalidate(value)
                }
            }).catch(e => {
                console.error(`Error loading resource '${id}':`, e)
            })
        }
        if (dependent && info.value == null) {
            info.dependents.add(dependent)
        }
        return info.value ?? null
    }

}
