import Model from "./Model"

type Patch<T> = T | null | {
    [P in keyof T]?: Patch<T[P]>
}

export function createPatch(path: string[], object) {
    if (path.length === 0) {
        return object
    }
    return createPatch(path.slice(0, -1), { [path[path.length - 1]]: object })
}

export default Patch
