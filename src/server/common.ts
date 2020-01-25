import { exec } from "child_process"

export async function execute(command): Promise<string>{
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error + stdout)
            }
            else {
                resolve(stdout)
            }
        })
    })
}
