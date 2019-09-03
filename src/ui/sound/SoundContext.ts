
export default class SoundContext {

    cache = new Map<string,HTMLAudioElement[]>()

    play(url: string, properties?: { [name in keyof HTMLAudioElement]?: HTMLAudioElement[name] }) {
        let stack = this.cache.get(url)
        if (stack == null) {
            this.cache.set(url, stack = [])
        }
        let audio = stack.pop()
        if (audio == null) {
            stack.push(audio = new Audio(url))
            audio.onended = (e) => {
                // when the audio ends push it back onto the stack
                stack!.push(audio!)
            }
        }
        Object.assign(audio, properties)
        audio.play()
    }

}
