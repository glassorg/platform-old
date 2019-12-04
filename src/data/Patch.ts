import Model from "./Model"

type Patch<T> = T | null | {
    [P in keyof T]?: T[P] | null | object
    // any    // TODO later, make this correctly recurse with Patch<T[P]>
}

export function createPatch(path: Readonly<Array<string | number>> | undefined, object) {
    if (path == null || path.length === 0) {
        return object
    }
    return createPatch(path.slice(0, -1), { [path[path.length - 1]]: object })
}

export default Patch
