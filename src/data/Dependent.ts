import Key from "./Key";
import State from "./State";

export type Unwatched = () => void

export default abstract class Dependent extends State {

    static watched(key: Key): Unwatched {
        throw new Error(`${this.name}.watched must be overriden`)
    }

    static store = "dependent"

}
