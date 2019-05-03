
let buffer = new Uint8Array(16)
function guid() {
    let array: string[] = Array(20)
    window.crypto.getRandomValues(buffer)
    for (let i = 0; i < buffer.length; i++) {
        let string = buffer[i].toString(16)
        if (string.length < 2)
            array.push("0")
        array.push(string)
        if (i === 4 || i === 6 || i === 8 || i === 10)
            array.push("-")
    }
    return array.join("")
}

export const format = /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/i

export default guid