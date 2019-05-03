
export default function localize(literals: TemplateStringsArray, ...args) {
    let result: string[] = []
    for (let i = 0; i < literals.length; i++) {
        result.push(literals[i])
        if (args[i] !== undefined)
            result.push(args[i])
    }
    return result.join("")
}