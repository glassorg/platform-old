import Firestore from "../../server/gcloud/Firestore";
import * as webServer from "../../server/webServer";
import Key from "../../data/Key";
import namespace from "../../model";
import sendgrid from "../../server/sendgrid";
import * as crypto from "../../utility/crypto";
import http from "../../utility/http";
import { Request, Response } from "express";
import { default as twilio, fromPhone } from "../../server/twilio";
import Patch from "../../data/Patch";
import { LoginFormModel, LoginFormState } from "../../ui/html/components/Login/LoginForm";
import { SignupFormState, SignupFormModel } from "../../ui/html/components/Login/SignupForm";
import { formatPhoneES164 } from "../../utility/phone";
import User from "../../model/User";
import Identity from "../../model/Identity";
import { signToken } from "../../server/IdentityProvider";
import * as secret from "../../server/secret";

const second = 1
const minute = 60 * second
const hour = 60 * minute
const day = 24 * hour
const database = webServer.instance.database

function getAbsoluteUrl(req: Request, url) {
    return `${req.protocol}://${req.get("host")}${url}`
}

export async function login(state: LoginFormModel): Promise<Patch<LoginFormState>> {
    if (!(state instanceof LoginFormModel)) {
        return { status: "error", error: "invalid state" }
    }
    let user = await database.get(Key.create(namespace.User, state.email))

    if (user == null) {
        return { status: "invalid user" }
    }

    if (!(user instanceof User)) {
        console.error("Entity is not a User!?", user)
        return { status: "error", error: "User is corrupted" }
    }

    if (crypto.hashVerify(state.password, user.passwordHash)) {
        let token = new Identity({
            name: user.name,
            email: user.email,
            issued: new Date().toISOString()
        })
        return { status: "success", accessToken: signToken(token, 7 * day) }
    } else {
        return { status: "invalid password" }
    }
}

/**
 * Returns true if a User with this email exists, false otherwise.
 */
export async function exists(email: string): Promise<boolean> {
    let user = await database.get(Key.create(namespace.User, email))
    console.log(JSON.stringify({ email, user: user || null }))
    return user != null
}

export async function signup(user: SignupFormModel, req: Request, res: Response): Promise<Patch<SignupFormState>> {
    try {
        //  it's important that we check type here because if we don't
        //  then the import of SignupForm is removed by the compiler
        //  and we need it in order for the SignupFormModel to get registered
        //  with Model.serializer.register so we can deserialize it.
        console.log("headers", JSON.stringify(req.headers))
        if (!(user instanceof SignupFormModel)) {
            return { status: "submit error", error: "Expected SignupFormModel"}
        }
        if (await exists(user.email)) {
            return { status: "user exists" }
        }

        const rest: any = { ...user }
        rest.passwordHash = secret.encrypt(crypto.hash(user.password))
        delete rest.password
        delete rest.passwordConfirm
    
        const verifyEmailUrl = getAbsoluteUrl(req, `/api/user/${verifyEmail.name}`)
        const redirectUrl = req.headers.referer
        //  TEMP: made duration longer for easier testing.
        const token = secret.jwtSign({ step: "email", redirectUrl, ...rest }, 2000 * minute)
        const link = verifyEmailUrl + http.queryFromObject({token})
        console.log(`Sending Email Verification link\n${link}`)
        const [response] = await sendgrid.send({
            to: [user.email],
            from: "test@xpoint.com",
            subject: "XPoint Todo MVC Demo Signup",
            text: `Follow the link to verify your email: ${link}`
        })
        return { status: "mail sent" }
    } catch (e) {
        if (e.response) {
            console.error("Sendgrid Errors:", e.response.body.errors)
        } else {
            console.error("Signup Error", e)
        }
        return { status: "submit error", error: e.message }
    }
}

export async function verifyEmail(req: Request, res: Response) {
    const message = secret.jwtVerify(req.query.token)
    if (message == null) {
        return res.status(410).send(`This email verification link is expired, please signup again.`)
    }
    const { email, mobile, step, ...rest } = message
    if (step !== "email") {
        return res.send(`invalid step: ${email}`)
    }
    // res.send("verifyEmail: " + JSON.stringify({ email, step, ...rest }))
    const token = secret.jwtSign({ email, mobile, step: "mobile", ...rest }, 2000 * minute)
    let verifyMobileUrl = getAbsoluteUrl(req, `/api/user/${verifyMobile.name}`)
    let link = verifyMobileUrl + http.queryFromObject({token})
    console.log(`Sending Mobile Verification link\n${link}`)
    try {
        let result = await twilio.messages.create({
            to: formatPhoneES164(mobile),
            from: fromPhone,
            body: "To validate your mobile number and finish signup follow the link: " + link
        })
        // console.log("Result", result)
        res.send(`Email address verified. The final step is to verify your mobile number. Please check your mobile device for a text message and follow the link.`)
    } catch (e) {
        console.error("Error sending mobile verification:", e)
        res.send(`Error sending mobile verification.`)
    }
}

//  TODO:
//      [x] Create PasswordHash, encrypt and put in JWT.
//      [x] Remove Password and ConfirmPassword from JWT.
//      [x] Decrypt PasswordHash and store on new User record.
//      [x] Create new User record.
//      [x] Login -> validate user and password.
//      [x] Client auth token design.
//      [x] Server namespace design including private passwordHash.
//      [ ] we need to reply with patches back to client on data/put.
//      [ ] provide User authorization with requests, whitelist public apis.
//      [ ] implement Patch diff calculation and add tests.

export async function verifyMobile(req: Request, res: Response) {
    const message = secret.jwtVerify(req.query.token)
    if (message == null) {
        return res.status(410).send(`This email verification link is expired, please signup again.`)
    }
    const { redirectUrl, email, exp, step, ...rest } = message
    if (step !== "mobile") {
        return res.send(`invalid step: ${step}`)
    }
    // now decrypt the passwordHash
    console.log("rest", rest)
    rest.passwordHash = secret.decrypt(rest.passwordHash)

    const key = Key.create(namespace.User, email)
    try {
        const user = new User({ ...rest, key })

        database.put([user])
        res.send("User account successfully created. You can login now: " + redirectUrl)
    } catch (e) {
        console.error("verifyMobile error:", e)
        res.status(500).send("Error creating user account")
    }
}
