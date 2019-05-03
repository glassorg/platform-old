
export function flatten(array: any[], result: any[] = []) {
    for (let element of array) {
        if (element instanceof Array)
            flatten(element, result)
        else
            result.push(element)
    }

    return result
}