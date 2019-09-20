import Context from "../../../Context"
import Model from "../../../../data/Model"
import Key from "../../../../data/Key"
import User from "../../../../model/User"
import * as schema from "../../../../data/schema"
import Form from "./../Form"

@Model.class()
export class ForgotFormModel extends Model {

    @Model.property(User.properties.email!)
    email!: string

    @Model.property(schema.password, { title: "New Password", required: true })
    password!: string

    @Model.property(schema.password, {
        title: "Confirm New Password",
        required: true,
        validate(this: ForgotFormModel & object, value: string) {
            //  when validate is called in a form then
            //  `this` is UserSignup like, but not an actual instance
            return value === this.password
        },
        validateFailMessage: "Doesn't match New Password field"
    })
    passwordConfirm!: string

    static readonly key = Key.create(ForgotFormModel, "singleton")

}

export default function ForgotForm(c: Context) {
    const { begin, end, render } = c
    render(Form,
        {
            id: "forgotForm",
            descriptor: ForgotFormModel,
            oncomplete(user: ForgotFormModel) {
                console.log("Forgot not implemented: ", user)
            }
        }
    )
}
