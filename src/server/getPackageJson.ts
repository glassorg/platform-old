import fs from "fs"
import path from "path"
import { memoize } from "../utility/common"

const getPackageJson = memoize((dir = process.cwd()) => {
    let file = path.join(dir, "package.json")
    if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, "utf8"))
    }
    else {
        let newDir = path.dirname(dir)
        if (newDir === dir) {
            throw new Error(`package.json not found in or above: ${process.cwd()}`)
        }
        return getPackageJson(newDir)
    }
})

export default getPackageJson

export function getProjectId() {
    let packageJson = getPackageJson()
    return packageJson.id || packageJson.name
}
