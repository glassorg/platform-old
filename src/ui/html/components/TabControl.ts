import Context from "../../Context";
import Model from "../../../data/Model";
import Key from "../../../data/Key";
import State from "../../../data/State";
import { Render } from "../../Component";
import { div, span } from "../";
import "./TabControl.css";

@Model.class()
class TabControlState extends State {

    @Model.property({ type: "string" })
    active?: string

}

type Tab = {
    label: string,
    content?: Render<void>
}

export default Context.component(function TabControl(c: Context, p: {
    id: string
    class?: string
    activeTabId?: string
    tabs: { [id: string]: Tab }
    onchange?: (id: string) => void
}) {
    let { id, class: className = "", activeTabId, tabs, onchange } = p
    let key = Key.create(TabControlState, id)
    if (activeTabId == null)
        activeTabId = c.store.get(key).active || Object.keys(tabs)[0]
    let activeTab = tabs[activeTabId]
    c.begin(div, { class: "TabControl", id })
        c.begin(div, { class: "TabControl_Bar" })
            for (let id in tabs) {
                let tab = tabs[id]
                let active = tab === activeTab
                c.empty(span, {
                    class: `TabControl_Tab ${active ? "TabControl_Tab_active" : ""}`,
                    onclick(e) {
                        c.store.patch(key, { active: id })
                        if (onchange)
                            onchange(id)
                    }
                }, tab.label)
            }
        c.end(div)
        if (activeTab.content) {
            c.begin(div, { class: "TabControl_Content" })
                c.render(activeTab.content)
            c.end(div)
        }
    c.end(div)
})
