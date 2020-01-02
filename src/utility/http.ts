
export function getRelativeUrl(base: string, url: string) {
    if (/^(([a-z]+:)|\/)/.test(url)) {
        return url
    }
    const lastSlash = base.lastIndexOf("/")
    const root = lastSlash >= 0 ? base.slice(0, lastSlash + 1) : base
    return root + url
}

export function queryFromObject(obj) {
    return "?" + Object.keys(obj).map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(obj[k])).join("&")
}

export function objectFromQuery(query) {
    let entries = query.split(/[&?]/)
        .filter((pair) => pair.length > 0)
        .map((pair) => pair.split("="))
    let result = {}
    for (let [key, value] of entries)
        result[key] = decodeURIComponent(value)
    return result
}

export function request(url, method, options: {body?, parameters?, headers?}): Promise<string> {
    let {body, parameters, headers} = options
    return new Promise(function(resolve, reject) {
        let req = new XMLHttpRequest()

        let fullUrl = parameters ? url + queryFromObject(parameters) : url
        req.open(method, fullUrl, true)

        if (headers)
            for (let [key, value] of Object.entries(headers))
                req.setRequestHeader(key, value as string)

        req.onreadystatechange = () => {
            if (req.readyState === 4) {
                if (req.status >= 200 && req.status < 300)
                    resolve(req.responseText)
                else
                    reject(req.responseText)
            }
        }

        if (body)
            req.send(body)
        else
            req.send()
    })
}

export function post(url, options: {body?, parameters?, headers?}) {
    return request(url, "POST", options)
}

export function get(url, options: {body?, parameters?, headers?}) {
    return request(url, "GET", options)
}

export default { queryFromObject, objectFromQuery, request, post, get }