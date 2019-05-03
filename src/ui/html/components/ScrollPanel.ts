import Context from "../../Context";
import Model from "../../../data/Model";
import Key from "../../../data/Key";
import Stylesheets from "../Stylesheets";
import State from "../../../data/State";
import * as html from "../";
import { Render } from "../../Component";

Stylesheets.add(s => `
    .ScrollPanel {
        flex: 1 1 auto;
        overflow: auto;
    }
`)

@Model.class()
export class ScrollPanelState extends State {

    @Model.property({ type: "integer", default: 0, minimum: 0 })
    scrollLeft!: number
    
    @Model.property({ type: "integer", default: 0, minimum: 0 })
    scrollTop!: number
    
    @Model.property({ type: "integer", default: 0, minimum: 0 })
    scrollWidth!: number

    @Model.property({ type: "integer", default: 0, minimum: 0 })
    scrollHeight!: number
        
    @Model.property({ type: "integer", default: 0, minimum: 0 })
    offsetWidth!: number

    @Model.property({ type: "integer", default: 0, minimum: 0 })
    offsetHeight!: number

    get isScrolledToTop() {
        return this.scrollTop === 0
    }

    get isScrolledToBottom() {
        return (this.scrollTop + this.offsetHeight) === this.scrollHeight
    }

}

export default function ScrollPanel(c: Context, p: {
    id: string
    content: Render<void>
    class?: string
    value?: boolean
    onscroll?: (e: Event) => void
}) {
    let { id, content, class: className = "", value, onscroll } = p
    let key = Key.create(ScrollPanelState, id)
    let currentState = c.store.peek(key)
    let element = c.begin(html.div, {
        id,
        class: `ScrollPanel ${className}`,
        scrollTop: currentState.scrollTop,
        scrollLeft: currentState.scrollLeft,
        onscroll(this: HTMLDivElement, e: Event) {
            if (onscroll) {
                onscroll.call(this, e)
            }
            saveState()
        }
    })
        c.render(content)
    c.end(html.div)

    function saveState() {
        c.store.patch(key, {
            scrollTop: element.scrollTop,
            scrollLeft: element.scrollLeft,
            offsetWidth: element.offsetWidth,
            offsetHeight: element.offsetHeight,
            scrollWidth: element.scrollWidth,
            scrollHeight: element.scrollHeight
        })
    }

    //  because resizing can alter the relative sizes
    //  without triggering scroll, we need to listen to window resize
    //  events in order to make sure our state is always correct
    window.addEventListener("resize", saveState)
    //  we return a dispose function so that we can unlisten
    return () => window.removeEventListener("resize", saveState)
}
