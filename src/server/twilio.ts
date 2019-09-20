import * as webServer from "./webServer"
import twilio from "twilio"

const config = webServer.instance.config.twilio
export const fromPhone = config!.fromPhone
export default twilio(config!.account, config!.token)
