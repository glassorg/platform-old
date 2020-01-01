import ResourceLoader from "./ResourceLoader";
import Graphics from "../Graphics";
import Node from "../scene/Node";

class ResourceInfo<T = any> {

    loading = false
    dependents = new Set<Node>()
    value?: T

}

export default class ResourceManager {

    g: Graphics
    resources: Map<ResourceLoader,Map<string,ResourceInfo>>

    constructor(g: Graphics) {
        this.g = g
        this.resources = new Map<ResourceLoader,Map<string,ResourceInfo>>()
    }

    private getResourceInfo<T>(loader: ResourceLoader<T>, id: string): ResourceInfo<T> {
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

    public getResource<T>(loader: ResourceLoader<T>, id: string, dependent?: Node): T | null {
        let info = this.getResourceInfo(loader, id)
        if (!info.loading) {
            info.loading = true
            loader.load(this.g, id).then(value => {
                info.value = value
                for (let node of info.dependents.values()) {
                    node.markDirty()
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
