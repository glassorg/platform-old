import Context from "../../../Context"
import Model from "../../../../data/Model"
import Key from "../../../../data/Key"
import State from "../../../../data/State"
import TabControl from "../TabControl"
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"
import ForgotForm from "./ForgotForm"
import Identity from "../../../../model/Identity"
import invoke from "../../../../server/invoke"
import Store from "../../../../data/Store"
import { div, span, button } from "../.."

@Model.class()
class LoginState extends State {

    @Model.property({ default: "login" })
    mode!: "login" | "signup" | "forgot"

    static readonly key = Key.create(LoginState, "singleton")

}

let helloResponseKey = Key.create({ name: "helloResponse", store: "memory", type: "string" }, "singleton")
invoke("/api/hello", null).then((response: any) => {
    Store.default.patch(helloResponseKey, response.message)
})

export default function Login(c: Context) {
    let identity = Identity.get()
    if (identity) {
        div(() => {
            div(`Hello: ${c.store.get(helloResponseKey)}`)
            span(`Logged in as: ${identity!.name} (${identity!.email})`)
            button({
                onclick(e) {
                    Identity.revoke()
                },
                content: `Logout`
            })
        })
    } else {
        TabControl({
            id: "login",
            tabs: {
                login: {
                    label: "Login",
                    content: LoginForm
                },
                signup: {
                    label: "Signup",
                    content: SignupForm
                },
                forgot: {
                    label: "Forgot",
                    content: ForgotForm
                }
            }
        })
    }
}