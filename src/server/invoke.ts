import Model from "../data/Model"
import Identity from "../model/Identity"

//  invokes a server side remote api function
export default async function invoke<In, Out>(path: string, input: In): Promise<Out> {
    let identity = Identity.get()
    let headers: any = {
        "Content-Type": "application/json; charset=utf-8"
    }
    if (identity) {
        headers.token = identity.token
    }
    let result = await fetch(path, {
        method: "POST",
        headers,
        body: Model.serializer.stringify(input)
    })
    return Model.serializer.parse(await result.text())
}