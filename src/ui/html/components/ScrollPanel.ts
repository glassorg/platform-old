import Context from "../../Context"
import Model from "../../../data/Model"
import Key from "../../../data/Key"
import State from "../../../data/State"
import { div, span } from "../"
import "./ScrollPanel.css"
import { getPosition, bindEventListeners } from "../functions"

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

export default Context.component(function ScrollPanel(c: Context, p: {
    id: string
    class?: string
    content: () => void
    onscroll?: (e: Event) => void
}) {
    let { id, content, class: className = "", onscroll } = p
    let key = Key.create(ScrollPanelState, id)
    let state = c.store.peek(key)
    let container: HTMLElement
    let element = div({
        id,
        class: `ScrollPanel ${className} ${state.isScrolledToTop ? "ScrollPanel_top" : ""} ${state.isScrolledToBottom ? "ScrollPanel_bottom" : ""}`,
        content() {
            container = div({
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

    return bindEventListeners({
        window: {
            resize: saveState
        }
    })
})
