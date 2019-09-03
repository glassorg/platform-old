import Context from "../../../Context";
import Model from "../../../../data/Model";
import Key from "../../../../data/Key";
import State from "../../../../data/State";
import User from "../../../../model/User";
import * as schema from "../../../../data/schema";
import Form from "../Form";
import Identity from "../../../../model/Identity";
import * as html from "../../../html";

type Status = {
    message?: string
    canSubmit: boolean
}
export class LoginFormStatus {
    "not submitted": Status = { canSubmit: true, message: "Not submitted." }
    "invalid user": Status = { canSubmit: true, message: "User not found." }
    "invalid password": Status = { canSubmit: true, message: "Wrong password." } 
    "success": Status = { canSubmit: false, message: "Successful login." }
    "error": Status = { canSubmit: true, message: "Error occurred during login, please try again." }
}

@Model.class()
export class LoginFormState extends State {

    @Model.property({ enum: Object.keys(new LoginFormStatus()), default: "not submitted" })
    status!: keyof LoginFormStatus

    @Model.property(schema.string)
    error?: string

    @Model.property(schema.string)
    accessToken?: string

    static readonly key = Key.create(LoginFormState, "singleton")
    static store = "memory"

}

@Model.class()
export class LoginFormModel extends Model {

    @Model.property(User.properties.email!)
    email!: string

    @Model.property(schema.password, { title: "Password", required: true })
    password!: string

    static readonly key = Key.create(LoginFormModel, "singleton")

}

export default function LoginForm(c: Context) {
    let state = c.store.get(LoginFormState.key)
    c.begin(html.div)
        c.empty(html.p, "Status: " + state.status)
        c.render(Form,
            {
                id: "loginForm",
                descriptor: LoginFormModel,
                actionApi: "/api/user/login",
                actionKey: LoginFormState.key,
                oncomplete(newState: LoginFormState) {
                    if (newState.accessToken) {
                        Identity.set(newState.accessToken)
                    }
                    console.log("Login server response: ", state)
                }
            }
        )
    c.end(html.div)
}