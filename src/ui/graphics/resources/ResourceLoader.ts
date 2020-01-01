import Graphics from "../Graphics"

type ResourceLoader<T = any> = {

    load(g: Graphics, id: string): Promise<T>
    unload?(g: Graphics, id: string, resource: T)

}

export default ResourceLoader