import Dependent from "../../data/Dependent"
import State from "../../data/State"
import Key from "../../data/Key"
import Vector2 from "../math/Vector2"
import Store from "../../data/Store"

@State.class()
export default class MouseState extends Dependent {

    @State.property({ type: 'integer' })
    x!: number

    @State.property({ type: 'integer' })
    y!: number

    static key = Key.create(MouseState, "singleton")

    static watched(key: Key<MouseState>) {
        let target = window.document.body
        function onMouseMove(e: MouseEvent) {
            Store.default.patch(MouseState.key, { x: e.offsetX, y: e.offsetY })
        }
        target.addEventListener("mousemove", onMouseMove)
        return () => {
            target.removeEventListener("mousemove", onMouseMove)
        }
    }

}