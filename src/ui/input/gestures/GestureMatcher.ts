import PointerState from "../PointerState"

type GestureMatcher = (pointers: PointerState[]) => PointerState[];

export default GestureMatcher