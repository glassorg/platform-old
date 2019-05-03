import Context from "../../../Context";
import Model from "../../../../data/Model";
import Key from "../../../../data/Key";
import User from "../../../../model/User";
import * as schema from "../../../../data/schema";
import Form from "../Form";
import State from "../../../../data/State";
import { div, span, p } from "../../../html";

@Model.class()
export class SignupFormModel extends Model {

    @Model.property(User.properties.name!)
    name!: string

    @Model.property(User.properties.email!)
    email!: string

    @Model.property(User.properties.mobile!, { pattern: undefined })
    mobile!: string

    @Model.property(schema.password, { title: "Password", required: true })
    password!: string

    @Model.property(schema.password, {
        title: "Confirm Password",
        required: true,
        validate(this: SignupFormModel & object, value: string) {
            //  when validate is called in a form then
            //  `this` is SignupFormModel like, but not an actual instance
            return value === this.password
        },
        validateFailMessage: "Doesn't match Password field"
    })
    passwordConfirm!: string

    static readonly key = Key.create(SignupFormModel)

}

type Status = {
    message?: string
    canSubmit: boolean
}
export class SignupFormStatus {
    "not submitted": Status = { canSubmit: true }
    "submitting": Status = { canSubmit: false, message: "Processing..." }
    "user exists": Status = { canSubmit: true, message: "User with that email address already exists." } 
    "mail sent": Status = { canSubmit: false, message: "Check your email address for verification message." }
    "submit error": Status = { canSubmit: true, message: "Error occurred during signup, please try again." }
    static instance = new SignupFormStatus()
}

@Model.class()
export class SignupFormState extends State {

    @Model.property({ enum: Object.keys(SignupFormStatus.instance), default: "not submitted" })
    status!: keyof SignupFormStatus

    @Model.property(schema.string)
    error?: string

    static readonly key = Key.create(SignupFormState, "0")
    static store = "memory"

}

export default function SignupForm(c: Context) {
    const state = c.store.get(SignupFormState.key)
    c.begin(div)
        let status = SignupFormStatus.instance[state.status]
        c.begin(p)
            if (status.message) {
                c.text(`Status: ${status.message}`)
            }
        c.end(p)
        if (status.canSubmit) {
            c.render(Form,
                {
                    id: "signupForm",
                    actionApi: "/api/user/signup",
                    actionKey: SignupFormState.key,
                    descriptor: SignupFormModel,
                    onsubmit(user: SignupFormModel) {
                        c.store.patch(SignupFormState.key, { status: "submitting" })
                        console.log("Submitting: ", user)
                    }
                }
            )
        }
    c.end(div)
}
