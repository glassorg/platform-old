import Serializer, { typeKey } from "./Serializer"

export default class Structure {

    static parse(properties) {
        return Object.assign(Object.create(this.prototype), properties)
    }

    //  Structure class decorator 
    static class(properties?: { id?: string }) {
        return function(target) {
            //  register this Model for serialization
            Serializer.default.register(properties?.id ?? target.name, target)
            return target
        }
    }

}
