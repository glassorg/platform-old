import Model, { ModelSchema, ModelClass } from "./Model"

export type StateSchema<T = any> = ModelSchema & { default: T }
export type StateClass<T extends State> = ModelClass<T>

/**
 * State represents any Model which will always have a default value.
 * When 
 */
export default abstract class State extends Model {

    get isDefault() {
        //  the real reason this property is here is so that the compiler will distinguish
        //  Model from State. Otherwise the overloaded methods on IStateSource.peek and get
        //  will treat all Model instances as if they are State instances.
        return this === (this.constructor as any)._default
    }

    private static _default?: State
    static get default(): State {
        if (this._default == null)
            this._default = new (this as any)()
        return this._default as State
    }

}
