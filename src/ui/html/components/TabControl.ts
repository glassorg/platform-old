import Context from "../../Context";
import Model from "../../../data/Model";
import Key from "../../../data/Key";
import State from "../../../data/State";
import Stylesheets from "../Stylesheets";
import { Render } from "../../Component";
import html from "../";

export const TabControlHeight = 48

Stylesheets.add(s => `
    .TabControl {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
    }
    .TabControl_Bar {
        flex: 0 0 auto;
        display: flex;
        flex-direction: row;
        height: ${TabControlHeight}px;
        background: ${s.colors.background.strong};
        box-shadow: 0px 3px 3px 0px ${s.colors.shadow};
    }
    .TabControl_Tab {
        padding-left: 16px;
        padding-right: 16px;
        text-transform: uppercase;
        align-items: center;
        display: flex;
        cursor: pointer;
        border-bottom: solid 2px transparent;
        justify-content: center;
        flex: 1;
    }
    .TabControl_Tab_active {
        color: ${s.colors.highlight};
        border-bottom: solid 2px ${s.colors.highlight};
    }
    .TabControl_Content {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
    }
`)

@Model.class()
class TabControlState extends State {

    @Model.property({ type: "string" })
    active?: string

}

type Tab = {
    label: string,
    content?: Render<void>
}

export default function TabControl(c: Context, p: {
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
    c.begin(html.div, { class: "TabControl", id })
        c.begin(html.div, { class: "TabControl_Bar" })
            for (let id in tabs) {
                let tab = tabs[id]
                let active = tab === activeTab
                c.empty(html.span, {
                    class: `TabControl_Tab ${active ? "TabControl_Tab_active" : ""}`,
                    onclick(e) {
                        c.store.patch(key, { active: id })
                        if (onchange)
                            onchange(id)
                    }
                }, tab.label)
            }
        c.end(html.div)
        if (activeTab.content) {
            c.begin(html.div, { class: "TabControl_Content" })
                c.render(activeTab.content)
            c.end(html.div)
        }
    c.end(html.div)
}
