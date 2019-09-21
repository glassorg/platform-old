import Dependent from "../../data/Dependent";
import State from "../../data/State";
import Key from "../../data/Key";
import Vector2 from "../math/Vector2";
import Store from "../../data/Store";
import { bindEventListeners } from "../html/functions";

@State.class()
export default class WindowSize extends Dependent {

    @State.property({ type: 'integer' })
    width!: number

    @State.property({ type: 'integer' })
    height!: number

    static key = Key.create(WindowSize, "singleton")

    static watched(key: Key<WindowSize>) {
        function update() {
            Store.default.patch(WindowSize.key, { width: window.innerWidth, height: window.innerHeight })
        }
        update()
        return bindEventListeners({
            window: {
                resize() {
                    update()
                }
            }
        })
    }

}