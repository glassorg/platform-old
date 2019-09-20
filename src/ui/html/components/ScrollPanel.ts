import Context from "../../Context"
import Model from "../../../data/Model"
import Key from "../../../data/Key"
import State from "../../../data/State"
import { div, span } from "../"
import "./ScrollPanel.css"
import { getPosition } from "../functions"

@Model.class()
export class ScrollPanelState extends State {

    @Model.property({ type: "number", default: 0, minimum: 0 })
    scrollLeft!: number
    
    @Model.property({ type: "number", default: 0, minimum: 0 })
    scrollTop!: number
    
    @Model.property({ type: "number", default: 0, minimum: 0 })
    scrollWidth!: number

    @Model.property({ type: "number", default: 0, minimum: 0 })
    scrollHeight!: number
        
    @Model.property({ type: "number", default: 0, minimum: 0 })
    offsetWidth!: number

    @Model.property({ type: "number", default: 0, minimum: 0 })
    offsetHeight!: number

    get isScrolledToTop() {
        return this.scrollTop === 0
    }

    get isScrolledToBottom() {
        return (this.scrollTop + this.offsetHeight) === this.scrollHeight
    }

}

function autoscrollDragScrollSpeed(position: number /* 0 - 1 */) {
    const factor = 10
    const scrollSize = 0.1
    // no scroll in the inner dead zone
    if (position > scrollSize && position < (1 - scrollSize)) {
        return 0
    }
    const sign = Math.sign(position - 0.5)
    const alpha = (sign < 0 ? position : 1 - position) - scrollSize
    const speed = Math.pow(alpha, 2) * factor * sign
    return speed
}

export default Context.component(function ScrollPanel(c: Context, p: {
    id: string
    class?: string
    content: () => void
    onscroll?: (e: Event) => void
}) {
    let { id, content, class: className = "", onscroll } = p
    let autoScrollOnDrag = true
    let dragging = false
    let dragEvent: MouseEvent | null = null
    let dragIntervalId
    let dragListener = () => {
        let position = getPosition(dragEvent!, element)
        let relativePosition = position.y / element.clientHeight
        let autoScrollRelative = autoscrollDragScrollSpeed(relativePosition)
        let autoScrollAbsolute = autoScrollRelative * element.clientHeight
        let content = container.firstElementChild as HTMLElement
        // let maxHeight = content.style.height ? content.clientHeight
        let scrollTo = Math.max(0, Math.min(content.clientHeight - container.clientHeight, container.scrollTop + autoScrollAbsolute))
        // console.log({ clientHeight: content.clientHeight, offsetHeight: container.offsetHeight, scrollHeight: container.scrollHeight, contentHeight: content.style.height })
        container.scroll({
            top: scrollTo,
            behavior: "smooth"
        })
    }
    let key = Key.create(ScrollPanelState, id)
    let state = c.store.peek(key)
    let container: HTMLElement
    let element = div({
        id,
        class: `ScrollPanel ${className} ${state.isScrolledToTop ? "ScrollPanel_top" : ""} ${state.isScrolledToBottom ? "ScrollPanel_bottom" : ""}`,
        content() {
            container = div({
                // onpointerdown(e: PointerEvent) {
                //     dragging = true
                //     dragEvent = e
                //     dragIntervalId = setInterval(dragListener, 100)
                // },
                // onpointerup(e: PointerEvent) {
                //     dragging = false
                //     dragEvent = null
                //     clearInterval(dragIntervalId)
                //     dragIntervalId = null
                // },
                // onpointermove(e: PointerEvent) {
                //     if (dragging) {
                //         dragEvent = e
                //     }
                // },
                onscroll(this: HTMLDivElement, e: Event) {
                    if (onscroll) {
                        onscroll.call(this, e)
                    }
                    saveState()
                    state = c.store.peek(key)
                    // dynamically update scroll
                    element.classList.toggle("ScrollPanel_top", state.isScrolledToTop)
                    element.classList.toggle("ScrollPanel_bottom", state.isScrolledToBottom)
                },
                content
            })
        }
    })

    function saveState() {
        c.store.patch(key, {
            scrollTop: container.scrollTop,
            scrollLeft: container.scrollLeft,
            offsetWidth: container.offsetWidth,
            offsetHeight: container.offsetHeight,
            scrollWidth: container.scrollWidth,
            scrollHeight: container.scrollHeight
        })
    }

    //  this could be done with a declarative return like so
    // return {
    //     window: {
    //         resize() {
    //             saveState()
    //         }
    //     }
    // }
    //  because resizing can alter the relative sizes
    //  without triggering scroll, we need to listen to window resize
    //  events in order to make sure our state is always correct
    window.addEventListener("resize", saveState)
    //  we return a dispose function so that we can unlisten
    return () => {
        window.removeEventListener("resize", saveState)
        if (dragIntervalId) {
            clearInterval(dragIntervalId)
        }
    }
})
