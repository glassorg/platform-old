
export function formatPhoneES164(phone: string) {
    return phone.replace(/[\(\) -]/g, "")
}

export function formatPhoneNumberUSA(phone: string): string | null {

    let n: string[] = []
    for (let i = 0; i < phone.length; i++) {
        let char = phone[i]
        if (/[0-9]/.test(char)) {
            n.push(char)
        }
    }

    if (n.length === 10) {
        n.unshift("1")
    }

    if (n.length !== 11) {
        return phone
    }

    return `+${n[0]} (${n[1]}${n[2]}${n[3]}) ${n[4]}${n[5]}${n[6]}-${n[7]}${n[8]}${n[9]}${n[10]}`
}