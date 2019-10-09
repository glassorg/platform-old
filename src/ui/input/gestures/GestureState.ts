import PointerState from "../PointerState"
import State from "../../../data/State"

@State.class()
export default class GestureState extends State {

    /**
     * The pointers currently matched to this gesture.
     */
    @State.property({ default: [] })
    captured!: PointerState[]

    static store = "memory"

}