import Model, { ModelClass } from "./Model"

export function isNamespace(value): value is Namespace {
    for (let name in value) {
        if (Model.isClass(value[name])) {
            return true
        }
    }
    return false
}

type Namespace = { [name: string]: ModelClass | undefined }
export default Namespace
