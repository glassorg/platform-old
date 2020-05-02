import Context from "../../Context"
import { div, span, script, link, a } from ".."
import * as firebase from "firebase/app"
import * as firebaseui from "firebaseui"
import User from "../../../model/User"

export type AuthProperties = {
    signInSuccessUrl?: string,
    termsOfServiceUrl: string
    privacyPolicyUrl: string,
    content: (() => void),
}

function showSignIn(p: AuthProperties) {
    // FirebaseUI config.
    let uiConfig = {
        signInSuccessUrl: p.signInSuccessUrl ?? document.location.toString(),
        signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            // firebase.auth.GithubAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
            // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
        ],
        // tosUrl and privacyPolicyUrl accept either url string or a callback
        // function.
        // Terms of service url/callback.
        tosUrl: p.termsOfServiceUrl,
        // Privacy policy url/callback.
        privacyPolicyUrl: function() {
            window.location.assign(p.privacyPolicyUrl);
        }
    };

    // Initialize the FirebaseUI Widget using Firebase.
    let ui = new firebaseui.auth.AuthUI(firebase.auth());
    // The start method will wait until the DOM is loaded.

    // if (ui.isPendingRedirect()) {
        ui.start('#firebaseui-auth-container', uiConfig);
    // }    
}

export default Context.component(function AuthHeader(c: Context, p: AuthProperties) {
    const user = c.store.get(User.key)
    div({
        content() {
            // script({ src: "https://www.gstatic.com/firebasejs/ui/4.5.0/firebase-ui-auth.js" })
            link({ type: "text/css", rel:"stylesheet", href:"https://www.gstatic.com/firebasejs/ui/4.5.0/firebase-ui-auth.css" })
            div({ id: "firebaseui-auth-container" })
            if (user) {
                span({
                    title: user.email,
                    content: `You are logged in as: ${user.name} `
                })
                a({
                    href: "#",
                    onclick(e) {
                        firebase.auth().signOut().then(() => {
                            console.log("Signed out")
                        })
                        return false
                    },
                    content: `Logout`
                })

                p.content()
            }
            else {
                showSignIn(p)
            }
        }
    })

})
