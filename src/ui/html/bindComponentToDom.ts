import Component, { Render } from "../Component";
import Store from "../../data/Store";
import Context from "../Context";
import DependencyTracker from "../../utility/DependencyTracker";
import DefaultStore from "../../data/stores/DefaultStore";

export default function bindComponentToDom<T>(
    container: HTMLElement,
    componentType: Render<T>,
    componentProperties: T,
    store: DefaultStore = Store.default
) {
    let pendingRenders = new Set<Component>()

    function render(time) {
        let start = performance.now()
        let count = pendingRenders.size

        // reset stats
        context.resetStats()

        context.rerender(pendingRenders, time)
        pendingRenders.clear()

        let finish = performance.now()
        let delta = finish - start
        //  using debug so that by default it's not visible
        //  if you want to see it you have to enable "verbose" in the browser console settings
        console.debug(`${delta.toFixed(2)} ms: Update ${count}, Skipped: ${context.skipped}, Reused: ${context.recycled}, Removed: ${context.removed}, Added: ${context.created}`)
    }

    function queueRender(components: Set<Component>) {
        if (components.size === 0) {
            return
        }

        let alreadyQueued = pendingRenders.size > 0
        for (let component of components) {
            pendingRenders.add(component)
        }

        if (!alreadyQueued) {
            requestAnimationFrame(render)
        }
    }

    //  create dependency tracker to track which components are dependent upon which keys
    let dependencies = new DependencyTracker<Component, string>()
    //  listen to writes on the low level store
    store.addWriteListener((key) => {
        queueRender(dependencies.getDependents(key.string))
    })
    store.addReadListener(key => {
        if (context.component) {
            dependencies.add(context.component, key.string)
        }
    })
    let context = new Context(container)
    context.onDispose = (component: Component) => {
        dependencies.remove(component)
    }
    // now render our main component
    context.beginRender(container)
    context.render(componentType, componentProperties)
    context.endRender()

}
