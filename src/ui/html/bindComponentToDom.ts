import Component, { Render } from "../Component"
import Store from "../../data/Store"
import Context from "../Context"
import DependencyTracker from "../../utility/DependencyTracker"
// import * as DefaultStore from "../../data/stores/DefaultStore"
import Key from "../../data/Key"

export default function bindComponentToDom<T>(
    container: HTMLElement,
    componentType: Render<T>,
    componentProperties: T,
    store?: Store
) {
    if (store == null) {
        store = Store.default
        if (store == null) {
            //  there is a circular dependency somewhere.
            //  between Store -> Key -> Model -> Store
            //  have not been able to remove it without losing State typing.
            //  so we're still importing this one with require.
            store = Store.default = require("../../data/stores/DefaultStore").create()
        }
    }

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
    function writeListener(key: Key) {
        queueRender(dependencies.getDependents(key.string))
    }
    function readListener(key: Key) {
        if (context.component) {
            dependencies.add(context.component, key.string)
        }
    }
    store.addWriteListener(writeListener)
    store.addReadListener(readListener)

    let context = new Context(container)
    context.onDispose = (component: Component) => {
        dependencies.remove(component)
    }
    // now render our main component
    context.beginRender(container)
    context.render(componentType, componentProperties)
    context.endRender()

    //  return a function which can be used to unbind this
    return () => {
        store.removeWriteListener(writeListener)
        store.removeReadListener(readListener)
    }
}
