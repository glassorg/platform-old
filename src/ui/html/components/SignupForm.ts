import Context from "../../Context";
import Model from "../../../data/Model";
import Form from "./Form";
import User from "../../../model/User";
import * as schema from "../../../data/schema";
import html from "../";

//  page with form
//  api handler
//  how much cohesion?
//  page lives
//      www/mypage.ts
//  api lives
//      www/api/myhandler.ts
//          Handler<InputType,OutputType>
//  server side load can use require... to find handler!

@Model.class()
class CreateUser extends Model {

    @Model.property(User.properties.name!)
    name!: string

    @Model.property(User.properties.email!)
    email!: string

    @Model.property(User.properties.mobile!)
    mobile!: string

    @Model.property(schema.password, { title: "Password", required: true })
    password!: string

    @Model.property(schema.password, {
        title: "Confirm Password",
        required: true,
        validate(this: CreateUser & object, value: string) {
            //  when validate is called in a form then
            //  `this` is UserSignup like, but not an actual instance
            return value === this.password
        },
        validateFailMessage: "Doesn't match password field"
    })
    passwordConfirm!: string

}

export default function SignupForm(c: Context, { schema }) {
    c.begin(html.div)
        c.render(Form,
            {
                descriptor: CreateUser,
                onsubmit(user: CreateUser) {
                    console.log("Create: ", user)
                }
            }
        )
    c.end(html.div)
}