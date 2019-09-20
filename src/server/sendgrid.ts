import * as webServer from "./webServer"

import sendgrid from "@sendgrid/mail"
sendgrid.setApiKey(webServer.instance.config.sendgrid!.apiKey)
export default sendgrid
